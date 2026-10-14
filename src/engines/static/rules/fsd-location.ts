export interface FsdLocation {
  layer: string;
  layerIndex: number;
  /** The slice directory directly under the layer, if any, e.g. "user". */
  slice: string | undefined;
  /** Path segments starting at (and including) the layer segment. */
  segmentsFromLayer: string[];
}

/**
 * Locates a file within the FSD layer/slice structure by matching a path
 * segment against the configured layer names, e.g.
 * ".../src/entities/user/model.ts" -> { layer: "entities", slice: "user", ... }.
 *
 * Search starts right after the last "src" segment, if any, so an ancestor
 * directory that happens to share a layer's name (e.g. a repo checked out
 * under ".../features-team/project/src/entities/...") isn't mistaken for
 * the real layer. Falls back to searching the whole path when there's no
 * "src" segment. Returns undefined if no layer name is found.
 */
export function locateInFsd(filePath: string, layers: string[]): FsdLocation | undefined {
  const segments = filePath.split(/[\\/]/);
  const srcIndex = segments.lastIndexOf('src');
  const searchStart = srcIndex === -1 ? 0 : srcIndex + 1;

  const layerSegmentIndex = segments.findIndex(
    (segment, index) => index >= searchStart && layers.includes(segment),
  );
  if (layerSegmentIndex === -1) return undefined;

  const layer = segments[layerSegmentIndex]!;
  const segmentsFromLayer = segments.slice(layerSegmentIndex);
  // A slice is a directory between the layer and the file itself; a file
  // sitting directly at <layer>/file.ts has no slice.
  const slice = segmentsFromLayer.length >= 3 ? segmentsFromLayer[1] : undefined;

  return {
    layer,
    layerIndex: layers.indexOf(layer),
    slice,
    segmentsFromLayer,
  };
}
