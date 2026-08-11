import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../core/config.js';
import { StaticEngine } from '../engines/static/index.js';
import { collectSourceFiles } from './files.js';

const REPO_ROOT = process.cwd();
const SAMPLE_PROJECT_SRC = join(REPO_ROOT, 'examples', 'sample-fsd-project', 'src');

describe('sample-fsd-project', () => {
  it('catches the seeded layer-direction violation', async () => {
    const config = await loadConfig(join(REPO_ROOT, 'guardrail.config.yaml'));
    const files = await collectSourceFiles(SAMPLE_PROJECT_SRC);

    const engine = new StaticEngine();
    const violations = await engine.check(files, config);

    expect(
      violations.some(
        (violation) =>
          violation.ruleId === 'layer-direction' && violation.file.endsWith('broken-import.ts'),
      ),
    ).toBe(true);
  });
});
