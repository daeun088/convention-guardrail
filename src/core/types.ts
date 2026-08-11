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
  rules: Record<string, RuleConfig>;
}

export interface EngineInterface {
  readonly name: string;
  check(files: string[], config: GuardrailConfig): Promise<Violation[]>;
}
