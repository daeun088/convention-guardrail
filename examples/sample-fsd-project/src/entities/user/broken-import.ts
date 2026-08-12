// Deliberate layer-direction violation: the "entities" layer may not
// import from "features" (a higher layer). Kept here to exercise the
// seeded violation in tests and CLI demos.
import { editUserName } from '../../features/edit-user/index.js';

export const brokenUsage = editUserName;
