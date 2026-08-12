import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { GuardrailConfig } from '../../core/types.js';
import { StaticEngine } from './index.js';

const config: GuardrailConfig = {
  layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
  rules: {
    'layer-direction': { enabled: true, severity: 'error' },
    'same-layer-cross-import': { enabled: true, severity: 'error' },
    'public-api': { enabled: true, severity: 'warning' },
  },
};

describe('StaticEngine layer-direction rule', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'guardrail-static-'));
    await mkdir(join(dir, 'src', 'entities', 'user'), { recursive: true });
    await mkdir(join(dir, 'src', 'features', 'foo'), { recursive: true });

    await writeFile(join(dir, 'src', 'entities', 'user', 'index.ts'), `export const user = 'user';\n`);
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reports no violation for a valid lower-layer import', async () => {
    const filePath = join(dir, 'src', 'features', 'foo', 'index.ts');
    await writeFile(
      filePath,
      `import { user } from '../../entities/user/index.js';\nexport const foo = user;\n`,
    );

    const engine = new StaticEngine();
    const violations = await engine.check([filePath], config);

    expect(violations).toEqual([]);
  });

  it('reports one violation for a higher-layer import', async () => {
    const filePath = join(dir, 'src', 'entities', 'user', 'consumer.ts');
    await writeFile(
      filePath,
      `import { foo } from '../../features/foo/index.js';\nexport const consumer = foo;\n`,
    );
    await writeFile(
      join(dir, 'src', 'features', 'foo', 'index.ts'),
      `export const foo = 'foo';\n`,
    );

    const engine = new StaticEngine();
    const violations = await engine.check([filePath, join(dir, 'src', 'features', 'foo', 'index.ts')], config);

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      ruleId: 'layer-direction',
      severity: 'error',
      file: filePath,
    });
  });

  it('reports one violation for an import outside any recognized layer', async () => {
    await mkdir(join(dir, 'lib'), { recursive: true });
    await writeFile(join(dir, 'lib', 'helper.ts'), `export const helper = 'helper';\n`);

    const filePath = join(dir, 'src', 'entities', 'user', 'consumer.ts');
    await writeFile(
      filePath,
      `import { helper } from '../../../lib/helper.js';\nexport const consumer = helper;\n`,
    );

    const engine = new StaticEngine();
    const violations = await engine.check([filePath, join(dir, 'lib', 'helper.ts')], config);

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      ruleId: 'layer-direction',
      severity: 'error',
      file: filePath,
    });
    expect(violations[0]?.message).toMatch(/unrecognized layer/);
  });
});

describe('StaticEngine same-layer-cross-import rule', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'guardrail-static-'));
    await mkdir(join(dir, 'src', 'features', 'foo'), { recursive: true });
    await mkdir(join(dir, 'src', 'features', 'bar'), { recursive: true });
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reports no violation for an import within the same slice', async () => {
    const filePath = join(dir, 'src', 'features', 'foo', 'index.ts');
    await writeFile(join(dir, 'src', 'features', 'foo', 'helper.ts'), `export const helper = 'helper';\n`);
    await writeFile(filePath, `import { helper } from './helper.js';\nexport const foo = helper;\n`);

    const engine = new StaticEngine();
    const violations = await engine.check(
      [filePath, join(dir, 'src', 'features', 'foo', 'helper.ts')],
      config,
    );

    expect(violations).toEqual([]);
  });

  it('reports one violation for a sibling-slice import on the same layer, even via its barrel', async () => {
    await writeFile(join(dir, 'src', 'features', 'bar', 'index.ts'), `export const bar = 'bar';\n`);

    const filePath = join(dir, 'src', 'features', 'foo', 'index.ts');
    await writeFile(filePath, `import { bar } from '../bar/index.js';\nexport const foo = bar;\n`);

    const engine = new StaticEngine();
    const violations = await engine.check(
      [filePath, join(dir, 'src', 'features', 'bar', 'index.ts')],
      config,
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      ruleId: 'same-layer-cross-import',
      severity: 'error',
      file: filePath,
    });
  });
});

describe('StaticEngine public-api rule', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'guardrail-static-'));
    await mkdir(join(dir, 'src', 'entities', 'user'), { recursive: true });
    await mkdir(join(dir, 'src', 'features', 'foo'), { recursive: true });
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reports no violation for a cross-slice import via the barrel', async () => {
    await writeFile(join(dir, 'src', 'entities', 'user', 'index.ts'), `export const user = 'user';\n`);

    const filePath = join(dir, 'src', 'features', 'foo', 'index.ts');
    await writeFile(
      filePath,
      `import { user } from '../../entities/user/index.js';\nexport const foo = user;\n`,
    );

    const engine = new StaticEngine();
    const violations = await engine.check(
      [filePath, join(dir, 'src', 'entities', 'user', 'index.ts')],
      config,
    );

    expect(violations).toEqual([]);
  });

  it('reports one violation for a cross-slice import that bypasses the barrel', async () => {
    await writeFile(
      join(dir, 'src', 'entities', 'user', 'model.ts'),
      `export interface UserModel { id: string }\n`,
    );

    const filePath = join(dir, 'src', 'features', 'foo', 'index.ts');
    await writeFile(
      filePath,
      `import type { UserModel } from '../../entities/user/model.js';\nexport type Foo = UserModel;\n`,
    );

    const engine = new StaticEngine();
    const violations = await engine.check(
      [filePath, join(dir, 'src', 'entities', 'user', 'model.ts')],
      config,
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      ruleId: 'public-api',
      severity: 'warning',
      file: filePath,
    });
  });
});
