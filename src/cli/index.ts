#!/usr/bin/env node
import { Command } from 'commander';
import picocolors from 'picocolors';
import { loadConfig } from '../core/config.js';
import type { Violation } from '../core/types.js';
import { StaticEngine } from '../engines/static/index.js';
import { collectSourceFiles } from './files.js';

/**
 * Prints violations to stdout, one per line as `file:line  ruleId  message`,
 * or a green "no violations" message when the list is empty.
 */
function printViolations(violations: Violation[]): void {
  if (violations.length === 0) {
    console.log(picocolors.green('No violations found.'));
    return;
  }

  for (const violation of violations) {
    const location = picocolors.dim(`${violation.file}:${violation.line}`);
    const rule = picocolors.yellow(violation.ruleId);
    console.log(`${location}  ${rule}  ${violation.message}`);
  }

  console.log(picocolors.red(`\n${violations.length} violation(s) found.`));
}

const program = new Command();

program
  .name('guardrail')
  .description('Catches architectural convention violations at AI code-generation time.');

program
  .command('check <path>')
  .description('Check <path> for convention violations using the static engine')
  .option('-c, --config <path>', 'path to guardrail.config.yaml', 'guardrail.config.yaml')
  .action(async (path: string, options: { config: string }) => {
    const config = await loadConfig(options.config);
    const files = await collectSourceFiles(path);
    const engine = new StaticEngine();
    const violations = await engine.check(files, config);

    printViolations(violations);
    process.exitCode = violations.length > 0 ? 1 : 0;
  });

await program.parseAsync(process.argv);
