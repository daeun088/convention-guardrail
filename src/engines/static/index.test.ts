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
