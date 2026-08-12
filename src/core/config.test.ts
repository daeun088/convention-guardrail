import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig, validateConfig } from './config.js';

describe('validateConfig', () => {
  it('accepts a well-formed config', () => {
    const config = validateConfig({
      layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
      rules: {
        'layer-direction': { enabled: true, severity: 'error' },
      },
    });

    expect(config.layers).toEqual(['app', 'pages', 'widgets', 'features', 'entities', 'shared']);
    expect(config.rules['layer-direction']).toEqual({ enabled: true, severity: 'error' });
  });

  it('defaults "sliceLessLayers" to an empty array when omitted', () => {
    const config = validateConfig({ layers: ['shared'], rules: {} });
    expect(config.sliceLessLayers).toEqual([]);
  });

  it('accepts a valid "sliceLessLayers" list', () => {
    const config = validateConfig({
      layers: ['features', 'entities', 'shared'],
      sliceLessLayers: ['shared'],
      rules: {},
    });
    expect(config.sliceLessLayers).toEqual(['shared']);
  });

  it('rejects a "sliceLessLayers" entry not present in "layers"', () => {
    expect(() =>
      validateConfig({
        layers: ['features', 'entities'],
        sliceLessLayers: ['shared'],
        rules: {},
      }),
    ).toThrow(/"sliceLessLayers" entry "shared" is not in "layers"/);
  });

  it('rejects a "sliceLessLayers" that is not an array of strings', () => {
    expect(() =>
      validateConfig({ layers: ['shared'], sliceLessLayers: 'shared', rules: {} }),
    ).toThrow(/"sliceLessLayers" must be an array of strings/);
  });

  it('rejects a non-object top level', () => {
    expect(() => validateConfig(null)).toThrow(/expected a YAML object/);
    expect(() => validateConfig('not an object')).toThrow(/expected a YAML object/);
  });

  it('rejects a missing or empty "layers" array', () => {
    expect(() => validateConfig({ layers: [], rules: {} })).toThrow(/"layers" must be/);
    expect(() => validateConfig({ rules: {} })).toThrow(/"layers" must be/);
  });

  it('rejects a rule without a boolean "enabled" field', () => {
    expect(() =>
      validateConfig({
        layers: ['shared'],
        rules: { 'layer-direction': { severity: 'error' } },
      }),
    ).toThrow(/must have a boolean "enabled" field/);
  });

  it('rejects an invalid "severity" value', () => {
    expect(() =>
      validateConfig({
        layers: ['shared'],
        rules: { 'layer-direction': { enabled: true, severity: 'critical' } },
      }),
    ).toThrow(/invalid "severity"/);
  });
});

describe('loadConfig', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'guardrail-config-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reads and validates a YAML config file from disk', async () => {
    const path = join(dir, 'guardrail.config.yaml');
    await writeFile(
      path,
      `
layers:
  - app
  - shared
rules:
  layer-direction:
    enabled: true
    severity: error
`,
    );

    const config = await loadConfig(path);
    expect(config.layers).toEqual(['app', 'shared']);
    expect(config.rules['layer-direction']?.enabled).toBe(true);
  });

  it('throws a descriptive error when the file does not exist', async () => {
    await expect(loadConfig(join(dir, 'missing.yaml'))).rejects.toThrow(/Could not read config file/);
  });

  it('throws a descriptive error on malformed YAML', async () => {
    const path = join(dir, 'broken.yaml');
    await writeFile(path, 'layers: [app, shared\nrules: {}');

    await expect(loadConfig(path)).rejects.toThrow(/Could not parse YAML/);
  });
});
