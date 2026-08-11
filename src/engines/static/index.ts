import { Project } from 'ts-morph';
import type { EngineInterface, GuardrailConfig, Violation } from '../../core/types.js';
import { checkLayerDirection } from './rules/layer-direction.js';

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
    }
    return violations;
  }
}
