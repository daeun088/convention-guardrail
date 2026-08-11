import { readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist']);

/**
 * Recursively collects .ts/.tsx files under `path`. If `path` is itself a
 * source file, returns just that file.
 */
export async function collectSourceFiles(path: string): Promise<string[]> {
  const stats = await stat(path);

  if (stats.isFile()) {
    return SOURCE_EXTENSIONS.has(extname(path)) ? [path] : [];
  }

  const entries = await readdir(path, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      files.push(...(await collectSourceFiles(join(path, entry.name))));
    } else if (SOURCE_EXTENSIONS.has(extname(entry.name))) {
      files.push(join(path, entry.name));
    }
  }

  return files;
}
