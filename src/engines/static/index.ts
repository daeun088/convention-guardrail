import { Project } from 'ts-morph';
import type { EngineInterface, GuardrailConfig, Violation } from '../../core/types.js';
import { checkLayerDirection } from './rules/layer-direction.js';
import { checkPublicApi } from './rules/public-api.js';
import { checkSameLayerCrossImport } from './rules/same-layer-cross-import.js';

export class StaticEngine implements EngineInterface {
  readonly name = 'static';

  async check(files: string[], config: GuardrailConfig): Promise<Violation[]> {
    const project = new Project({ skipAddingFilesFromTsConfig: true });
    project.addSourceFilesAtPaths(files);

    const violations: Violation[] = [];
    for (const file of files) {
      const sourceFile = project.getSourceFile(file);
      if (!sourceFile) continue;

      if (config.rules['layer-direction']?.enabled) {
        violations.push(...checkLayerDirection(sourceFile, config));
      }
      if (config.rules['same-layer-cross-import']?.enabled) {
        violations.push(...checkSameLayerCrossImport(sourceFile, config));
      }
      if (config.rules['public-api']?.enabled) {
        violations.push(...checkPublicApi(sourceFile, config));
      }
    }
    return violations;
  }
}
