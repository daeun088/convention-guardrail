import type { SourceFile } from 'ts-morph';
import type { GuardrailConfig, Severity, Violation } from '../../../core/types.js';
import { locateInFsd } from './fsd-location.js';

const RULE_ID = 'public-api';
const BARREL_FILE_PATTERN = /^index\.(ts|tsx)$/;

/** True if a file sits exactly at `<layer>/<slice>/index.ts(x)` — the slice's public API. */
function isSliceBarrel(segmentsFromLayer: string[]): boolean {
  return segmentsFromLayer.length === 3 && BARREL_FILE_PATTERN.test(segmentsFromLayer[2]!);
}

/**
 * Flags imports that reach into another slice's internals instead of going
 * through its public API (the slice's own index barrel). Imports within
 * your own slice are unaffected.
 */
export function checkPublicApi(sourceFile: SourceFile, config: GuardrailConfig): Violation[] {
  const { layers, sliceLessLayers } = config;
  const severity: Severity = config.rules[RULE_ID]?.severity ?? 'warning';

  const own = locateInFsd(sourceFile.getFilePath(), layers);
  if (!own || sliceLessLayers.includes(own.layer)) return [];

  const violations: Violation[] = [];
  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    const targetFile = importDeclaration.getModuleSpecifierSourceFile();
    if (!targetFile) continue;

    const target = locateInFsd(targetFile.getFilePath(), layers);
    if (!target || target.slice === undefined || sliceLessLayers.includes(target.layer)) continue;

    const sameSlice = target.layerIndex === own.layerIndex && target.slice === own.slice;
    if (sameSlice) continue;
    if (isSliceBarrel(target.segmentsFromLayer)) continue;

    violations.push({
      file: sourceFile.getFilePath(),
      line: importDeclaration.getStartLineNumber(),
      ruleId: RULE_ID,
      severity,
      message: `Import reaches into slice "${target.slice}" internals instead of its public API (via "${importDeclaration.getModuleSpecifierValue()}") — import from its index barrel instead`,
    });
  }
  return violations;
}
