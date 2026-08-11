// TODO(Phase 1, core types issue): define Rule, Violation, CheckResult, and EngineInterface here.
// See .claude/CLAUD.md for the shapes these types must take:
// - Rule: id, description, severity, layer/scope metadata
// - Violation: file, line, ruleId, severity, message, suggestion?
// - CheckResult: aggregated violations + summary for a single check run
// - EngineInterface: check(files, config) => Promise<Violation[]>
export {};
