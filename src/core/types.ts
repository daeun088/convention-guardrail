export type Severity = 'error' | 'warning';

export interface Rule {
  id: string;
  description: string;
  severity: Severity;
}

export interface Violation {
  file: string;
  line: number;
  ruleId: string;
  severity: Severity;
  message: string;
  suggestion?: string;
}

export interface CheckResult {
  violations: Violation[];
  filesChecked: number;
}

export interface RuleConfig {
  enabled: boolean;
  severity?: Severity;
}

export interface GuardrailConfig {
  /** FSD layer order, highest to lowest, e.g. ["app", "pages", ..., "shared"]. */
  layers: string[];
  /**
   * Layers that aren't organized into business-domain slices (e.g. "shared",
   * where the segment under the layer is a technical category like "ui" or
   * "lib", not a slice). Excluded from same-layer-cross-import and
   * public-api checks, since those rules assume the segment right under a
   * layer is a real slice boundary.
   */
  sliceLessLayers: string[];
  rules: Record<string, RuleConfig>;
}

export interface EngineInterface {
  readonly name: string;
  check(files: string[], config: GuardrailConfig): Promise<Violation[]>;
}
