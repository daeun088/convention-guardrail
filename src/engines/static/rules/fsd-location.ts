export interface FsdLocation {
  layer: string;
  layerIndex: number;
  /** The slice segment directly under the layer, if any, e.g. "user". */
  slice: string | undefined;
  /** Path segments starting at (and including) the layer segment. */
  segmentsFromLayer: string[];
}

/**
 * Locates a file within the FSD layer/slice structure by matching a path
 * segment against the configured layer names, e.g.
 * ".../src/entities/user/model.ts" -> { layer: "entities", slice: "user", ... }.
 * Returns undefined if no path segment matches a known layer.
 */
export function locateInFsd(filePath: string, layers: string[]): FsdLocation | undefined {
  const segments = filePath.split(/[\\/]/);
  const layerSegmentIndex = segments.findIndex((segment) => layers.includes(segment));
  if (layerSegmentIndex === -1) return undefined;

  const layer = segments[layerSegmentIndex]!;
  const segmentsFromLayer = segments.slice(layerSegmentIndex);

  return {
    layer,
    layerIndex: layers.indexOf(layer),
    slice: segmentsFromLayer[1],
    segmentsFromLayer,
  };
}
