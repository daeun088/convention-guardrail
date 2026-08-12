import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import type { GuardrailConfig, RuleConfig, Severity } from './types.js';

const DEFAULT_CONFIG_PATH = 'guardrail.config.yaml';

export async function loadConfig(path: string = DEFAULT_CONFIG_PATH): Promise<GuardrailConfig> {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    throw new Error(`Could not read config file at "${path}": ${(error as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (error) {
    throw new Error(`Could not parse YAML in "${path}": ${(error as Error).message}`);
  }

  return validateConfig(parsed, path);
}

export function validateConfig(parsed: unknown, path: string = DEFAULT_CONFIG_PATH): GuardrailConfig {
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(`Invalid config in "${path}": expected a YAML object at the top level.`);
  }

  const { layers, sliceLessLayers, rules } = parsed as Record<string, unknown>;

  if (
    !Array.isArray(layers) ||
    layers.length === 0 ||
    !layers.every((layer) => typeof layer === 'string')
  ) {
    throw new Error(`Invalid config in "${path}": "layers" must be a non-empty array of strings.`);
  }

  if (sliceLessLayers !== undefined) {
    if (!Array.isArray(sliceLessLayers) || !sliceLessLayers.every((layer) => typeof layer === 'string')) {
      throw new Error(`Invalid config in "${path}": "sliceLessLayers" must be an array of strings.`);
    }
    for (const layer of sliceLessLayers) {
      if (!layers.includes(layer)) {
        throw new Error(
          `Invalid config in "${path}": "sliceLessLayers" entry "${layer}" is not in "layers".`,
        );
      }
    }
  }

  if (typeof rules !== 'object' || rules === null) {
    throw new Error(`Invalid config in "${path}": "rules" must be an object.`);
  }

  const validatedRules: Record<string, RuleConfig> = {};
  for (const [ruleId, ruleConfig] of Object.entries(rules)) {
    if (typeof ruleConfig !== 'object' || ruleConfig === null) {
      throw new Error(`Invalid config in "${path}": rule "${ruleId}" must be an object.`);
    }

    const { enabled, severity } = ruleConfig as Record<string, unknown>;
    if (typeof enabled !== 'boolean') {
      throw new Error(
        `Invalid config in "${path}": rule "${ruleId}" must have a boolean "enabled" field.`,
      );
    }
    if (severity !== undefined && severity !== 'error' && severity !== 'warning') {
      throw new Error(
        `Invalid config in "${path}": rule "${ruleId}" has invalid "severity" (must be "error" or "warning").`,
      );
    }

    validatedRules[ruleId] =
      severity === undefined ? { enabled } : { enabled, severity: severity as Severity };
  }

  return {
    layers: layers as string[],
    sliceLessLayers: (sliceLessLayers as string[] | undefined) ?? [],
    rules: validatedRules,
  };
}
