import { describe, expect, it } from 'vitest';
import { locateInFsd } from './fsd-location.js';

const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

describe('locateInFsd', () => {
  it('locates the layer and slice for a typical nested file', () => {
    const location = locateInFsd('/repo/src/entities/user/model.ts', layers);
    expect(location).toMatchObject({ layer: 'entities', layerIndex: 4, slice: 'user' });
  });

  it('returns undefined when no path segment matches a known layer', () => {
    expect(locateInFsd('/repo/src/lib/helper.ts', layers)).toBeUndefined();
  });

  it('prefers the layer under "src" over an ancestor directory that happens to share a layer name', () => {
    const location = locateInFsd('/home/features-team/project/src/entities/user/model.ts', layers);
    expect(location).toMatchObject({ layer: 'entities', slice: 'user' });
  });

  it('leaves "slice" undefined for a file directly at the layer root', () => {
    const location = locateInFsd('/repo/src/shared/index.ts', layers);
    expect(location).toMatchObject({ layer: 'shared', slice: undefined });
  });

  it('still resolves "slice" for a file nested deeper inside a slice', () => {
    const location = locateInFsd('/repo/src/entities/user/model/UserModel.ts', layers);
    expect(location).toMatchObject({ layer: 'entities', slice: 'user' });
  });
});
