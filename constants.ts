import { GradeValue, RegionData } from './types';

export const DEFAULT_COMMENT = "Absence d'image radiographique indicatrice de pathologie ostéo-articulaire";

// Signature du Dr. Christophe Schlotterer (Base64 placeholder)
// Using a valid transparent pixel if the real one is too long or corrupted
export const SIGNATURE_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export const ANATOMICAL_REGIONS = [
  "Naviculaire Ant. G",
  "Naviculaire Ant. D",
  "Boulet Ant. G",
  "Boulet Ant. D",
  "Boulet Post. G",
  "Boulet Post. D",
  "Jarret G",
  "Jarret D",
  "Grasset G",
  "Grasset D",
  "Pieds",
  "Dos / Rachis"
];

export const INITIAL_REGIONS: RegionData[] = ANATOMICAL_REGIONS.map(label => ({
  id: label.toLowerCase().replace(/\s+/g, '-'),
  label,
  comment: DEFAULT_COMMENT,
  grade: GradeValue.G0,
  isIncluded: true,
  isLocked: false
}));
