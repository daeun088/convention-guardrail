import type { SourceFile } from 'ts-morph';
import type { GuardrailConfig, Severity, Violation } from '../../../core/types.js';
import { locateInFsd } from './fsd-location.js';

const RULE_ID = 'same-layer-cross-import';

/**
 * Flags imports that reach directly into a sibling slice on the same layer,
 * e.g. features/foo importing features/bar. Slices on the same layer must
 * go through a lower layer instead of importing each other directly, even
 * via a public API barrel.
 */
export function checkSameLayerCrossImport(sourceFile: SourceFile, config: GuardrailConfig): Violation[] {
  const { layers, sliceLessLayers } = config;
  const severity: Severity = config.rules[RULE_ID]?.severity ?? 'error';

  const own = locateInFsd(sourceFile.getFilePath(), layers);
  if (!own || own.slice === undefined || sliceLessLayers.includes(own.layer)) return [];

  const violations: Violation[] = [];
  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    const targetFile = importDeclaration.getModuleSpecifierSourceFile();
    if (!targetFile) continue;

    const target = locateInFsd(targetFile.getFilePath(), layers);
    if (!target || target.slice === undefined || sliceLessLayers.includes(target.layer)) continue;
    if (target.layerIndex !== own.layerIndex) continue;
    if (target.slice === own.slice) continue;

    violations.push({
      file: sourceFile.getFilePath(),
      line: importDeclaration.getStartLineNumber(),
      ruleId: RULE_ID,
      severity,
      message: `Slice "${own.slice}" cannot import directly from sibling slice "${target.slice}" on the same layer "${own.layer}" (via "${importDeclaration.getModuleSpecifierValue()}")`,
    });
  }
  return violations;
}
