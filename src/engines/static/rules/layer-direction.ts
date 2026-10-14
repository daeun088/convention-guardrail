import type { SourceFile } from 'ts-morph';
import type { GuardrailConfig, Severity, Violation } from '../../../core/types.js';
import { locateInFsd } from './fsd-location.js';

const RULE_ID = 'layer-direction';

/**
 * Flags imports that point to a higher (more privileged) or unrecognized
 * layer than the importing file's own layer. `layers` in config is ordered
 * highest to lowest, e.g. app > pages > widgets > features > entities > shared.
 */
export function checkLayerDirection(sourceFile: SourceFile, config: GuardrailConfig): Violation[] {
  const { layers } = config;
  const severity: Severity = config.rules[RULE_ID]?.severity ?? 'error';

  const own = locateInFsd(sourceFile.getFilePath(), layers);
  if (!own) return [];

  const violations: Violation[] = [];
  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    const targetFile = importDeclaration.getModuleSpecifierSourceFile();
    if (!targetFile) continue;

    const target = locateInFsd(targetFile.getFilePath(), layers);
    if (!target) {
      violations.push({
        file: sourceFile.getFilePath(),
        line: importDeclaration.getStartLineNumber(),
        ruleId: RULE_ID,
        severity,
        message: `Layer "${own.layer}" cannot import from an unrecognized layer (via "${importDeclaration.getModuleSpecifierValue()}")`,
      });
      continue;
    }
    if (target.layerIndex >= own.layerIndex) continue;

    violations.push({
      file: sourceFile.getFilePath(),
      line: importDeclaration.getStartLineNumber(),
      ruleId: RULE_ID,
      severity,
      message: `Layer "${own.layer}" cannot import from higher layer "${target.layer}" (via "${importDeclaration.getModuleSpecifierValue()}")`,
    });
  }
  return violations;
}
