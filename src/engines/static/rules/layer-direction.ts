import type { SourceFile } from 'ts-morph';
import type { GuardrailConfig, Severity, Violation } from '../../../core/types.js';

const RULE_ID = 'layer-direction';

/**
 * Finds the FSD layer a file belongs to by matching a path segment against
 * the configured layer names, e.g. ".../src/features/foo/index.ts" -> "features".
 * Returns -1 if no segment matches a known layer.
 */
function findLayerIndex(filePath: string, layers: string[]): number {
  const segments = filePath.split(/[\\/]/);
  for (const segment of segments) {
    const index = layers.indexOf(segment);
    if (index !== -1) return index;
  }
  return -1;
}

/**
 * Flags imports that point to a higher (more privileged) or unrecognized
 * layer than the importing file's own layer. `layers` in config is ordered
 * highest to lowest, e.g. app > pages > widgets > features > entities > shared.
 */
export function checkLayerDirection(sourceFile: SourceFile, config: GuardrailConfig): Violation[] {
  const { layers } = config;
  const severity: Severity = config.rules[RULE_ID]?.severity ?? 'error';

  const ownLayerIndex = findLayerIndex(sourceFile.getFilePath(), layers);
  if (ownLayerIndex === -1) return [];

  const violations: Violation[] = [];
  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    const targetFile = importDeclaration.getModuleSpecifierSourceFile();
    if (!targetFile) continue;

    const targetLayerIndex = findLayerIndex(targetFile.getFilePath(), layers);
    if (targetLayerIndex === -1) {
      violations.push({
        file: sourceFile.getFilePath(),
        line: importDeclaration.getStartLineNumber(),
        ruleId: RULE_ID,
        severity,
        message: `Layer "${layers[ownLayerIndex]}" cannot import from an unrecognized layer (via "${importDeclaration.getModuleSpecifierValue()}")`,
      });
      continue;
    }
    if (targetLayerIndex >= ownLayerIndex) continue;

    violations.push({
      file: sourceFile.getFilePath(),
      line: importDeclaration.getStartLineNumber(),
      ruleId: RULE_ID,
      severity,
      message: `Layer "${layers[ownLayerIndex]}" cannot import from higher layer "${layers[targetLayerIndex]}" (via "${importDeclaration.getModuleSpecifierValue()}")`,
    });
  }
  return violations;
}
