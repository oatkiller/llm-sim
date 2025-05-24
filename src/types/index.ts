// UUID4 types and utilities
export type { UUID4 } from './uuid';
export { 
  isUUID4, 
  generateUUID4, 
  assertUUID4, 
  toUUID4 
} from './uuid';

// Sim types and utilities
export type { 
  Sim, 
  CreateSimInput, 
  UpdateSimInput 
} from './sim';
export { 
  SIM_CONSTRAINTS,
  isValidLogLength,
  truncateLog,
  getLogPreview,
  hasLogContent
} from './sim';

// Metadata types and utilities
export type { 
  Metadata, 
  CreateMetadataInput, 
  UpdateMetadataInput 
} from './metadata';
export { 
  METADATA_CONSTRAINTS,
  isValidKeyLength,
  isValidValueLength,
  isValidMetadata,
  truncateKey,
  truncateValue,
  getValuePreview,
  hasMetadataContent
} from './metadata';

// Metadata helper functions
export type { MetadataOperationResult } from './metadata-helpers';
export {
  createMetadata as createMetadataHelper,
  updateMetadata as updateMetadataHelper,
  getMetadataForEntity,
  findMetadataByKey as findMetadataByKeyHelper,
  wouldExceedMetadataLimit,
  removeEntityMetadata,
  removeMetadataById,
  getMetadataStats
} from './metadata-helpers';

// Jotai atoms and storage
export type { SimAtom, MetadataAtom } from './atoms';
export {
  simAtomFamily,
  metadataAtomFamily,
  simIdsAtom,
  getSimAtom,
  getMetadataAtom,
  cleanupSimAtoms,
  STORAGE_CONFIG
} from './atoms';

// Zod schemas for validation
export {
  SimSchema,
  CreateSimInputSchema,
  UpdateSimInputSchema
} from './sim-schemas';
export {
  MetadataSchema,
  CreateMetadataInputSchema,
  UpdateMetadataInputSchema,
  MetadataArraySchema
} from './metadata-schemas';

// Data access layer with validation
export type { DataResult } from './data-access-layer';
export {
  dataStore,
  createSim,
  getSim,
  getAllSims,
  updateSim,
  deleteSim,
  createMetadata,
  getMetadata,
  getAllMetadataForEntity,
  updateMetadata,
  deleteMetadata,
  deleteAllMetadataForEntity,
  simExists,
  getMetadataCount,
  findMetadataByKey
} from './data-access-layer'; 