import { createStore } from 'jotai';
import type { UUID4 } from './uuid';
import { generateUUID4 } from './uuid';
import type { Sim, CreateSimInput, UpdateSimInput } from './sim';
import type { Metadata, CreateMetadataInput, UpdateMetadataInput } from './metadata';
import { getSimAtom, getMetadataAtom, simIdsAtom, cleanupSimAtoms } from './atoms';
import { isValidLogLength } from './sim';
import { isValidKeyLength, isValidValueLength } from './metadata';

/**
 * Result type for data operations that may fail
 */
export interface DataResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Enhanced store instance for data operations
 * This allows us to work with atoms outside of React components
 */
export const dataStore = createStore();

/**
 * SIM CRUD OPERATIONS
 */

/**
 * Validate sim input data
 */
function validateSimInput(input: CreateSimInput): string | null {
  if (input.log !== undefined && !isValidLogLength(input.log)) {
    return 'Log content exceeds maximum length (10,000 characters)';
  }
  return null;
}

/**
 * Validate sim update data
 */
function validateSimUpdateInput(input: UpdateSimInput): string | null {
  if (input.log !== undefined && !isValidLogLength(input.log)) {
    return 'Log content exceeds maximum length (10,000 characters)';
  }
  if (input.updatedAt !== undefined && (typeof input.updatedAt !== 'number' || input.updatedAt <= 0)) {
    return 'Updated timestamp must be a positive number';
  }
  return null;
}

/**
 * Create a new sim with validation
 * @param input - Sim creation data
 * @returns Result with the created sim or error
 */
export async function createSim(input: CreateSimInput): Promise<DataResult<Sim>> {
  try {
    // Validate input
    const validationError = validateSimInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }
    
    // Generate new sim
    const now = Date.now();
    const newSim: Sim = {
      id: generateUUID4(),
      log: input.log || '',
      createdAt: now,
      updatedAt: now,
    };
    
    // Store in atoms
    const simAtom = getSimAtom(newSim.id);
    dataStore.set(simAtom, newSim);
    
    // Update sim IDs list
    const currentIds = dataStore.get(simIdsAtom);
    dataStore.set(simIdsAtom, [...currentIds, newSim.id]);
    
    return { success: true, data: newSim };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create sim' };
  }
}

/**
 * Get a sim by ID
 * @param id - Sim ID
 * @returns Result with the sim or error
 */
export async function getSim(id: UUID4): Promise<DataResult<Sim>> {
  try {
    const simAtom = getSimAtom(id);
    const sim = dataStore.get(simAtom);
    
    if (!sim) {
      return { success: false, error: `Sim with ID ${id} not found` };
    }
    
    return { success: true, data: sim };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to retrieve sim' };
  }
}

/**
 * Get all sims
 * @returns Result with array of sims or error
 */
export async function getAllSims(): Promise<DataResult<Sim[]>> {
  try {
    const simIds = dataStore.get(simIdsAtom);
    const sims: Sim[] = [];
    
    for (const id of simIds) {
      const result = await getSim(id);
      if (result.success && result.data) {
        sims.push(result.data);
      }
    }
    
    return { success: true, data: sims };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to retrieve sims' };
  }
}

/**
 * Update a sim with validation
 * @param id - Sim ID
 * @param input - Update data
 * @returns Result with the updated sim or error
 */
export async function updateSim(id: UUID4, input: UpdateSimInput): Promise<DataResult<Sim>> {
  try {
    // Validate input
    const validationError = validateSimUpdateInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }
    
    // Get existing sim
    const simResult = await getSim(id);
    if (!simResult.success || !simResult.data) {
      return { success: false, error: simResult.error || 'Sim not found' };
    }
    
    // Update sim
    const updatedSim: Sim = {
      ...simResult.data,
      ...input,
      updatedAt: input.updatedAt || Math.max(Date.now(), simResult.data.createdAt + 1),
    };
    
    // Store updated sim
    const simAtom = getSimAtom(id);
    dataStore.set(simAtom, updatedSim);
    
    return { success: true, data: updatedSim };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update sim' };
  }
}

/**
 * Delete a sim and all its metadata (cascading delete)
 * @param id - Sim ID
 * @returns Result indicating success or error
 */
export async function deleteSim(id: UUID4): Promise<DataResult<void>> {
  try {
    // Check if sim exists
    const simResult = await getSim(id);
    if (!simResult.success) {
      return { success: false, error: simResult.error };
    }
    
    // Delete all metadata for this sim (cascading delete)
    const metadataResult = await deleteAllMetadataForEntity(id);
    if (!metadataResult.success) {
      return { success: false, error: metadataResult.error };
    }
    
    // Remove sim from IDs list
    const currentIds = dataStore.get(simIdsAtom);
    const updatedIds = currentIds.filter(simId => simId !== id);
    dataStore.set(simIdsAtom, updatedIds);
    
    // Clear the sim atom
    const simAtom = getSimAtom(id);
    dataStore.set(simAtom, null);
    
    // Clean up atoms and storage
    cleanupSimAtoms(id);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete sim' };
  }
}

/**
 * METADATA CRUD OPERATIONS
 */

/**
 * Validate metadata input data
 */
function validateMetadataInput(input: CreateMetadataInput): string | null {
  if (!isValidKeyLength(input.key)) {
    return 'Metadata key exceeds maximum length (100 characters)';
  }
  if (!isValidValueLength(input.value)) {
    return 'Metadata value exceeds maximum length (10,000 characters)';
  }
  return null;
}

/**
 * Validate metadata update data
 */
function validateMetadataUpdateInput(input: UpdateMetadataInput): string | null {
  if (input.key !== undefined && !isValidKeyLength(input.key)) {
    return 'Metadata key exceeds maximum length (100 characters)';
  }
  if (input.value !== undefined && !isValidValueLength(input.value)) {
    return 'Metadata value exceeds maximum length (10,000 characters)';
  }
  return null;
}

/**
 * Create new metadata with validation
 * @param input - Metadata creation data
 * @returns Result with the created metadata or error
 */
export async function createMetadata(input: CreateMetadataInput): Promise<DataResult<Metadata>> {
  try {
    // Validate input
    const validationError = validateMetadataInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }
    
    // Check if the sim exists
    const simResult = await getSim(input.entity_id);
    if (!simResult.success) {
      return { success: false, error: `Cannot create metadata: sim with ID ${input.entity_id} not found` };
    }
    
    // Generate new metadata
    const newMetadata: Metadata = {
      id: generateUUID4(),
      entity_id: input.entity_id,
      key: input.key,
      value: input.value,
    };
    
    // Add to existing metadata array
    const metadataAtom = getMetadataAtom(input.entity_id);
    const currentMetadata = dataStore.get(metadataAtom);
    const updatedMetadata = [...currentMetadata, newMetadata];
    dataStore.set(metadataAtom, updatedMetadata);
    
    return { success: true, data: newMetadata };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create metadata' };
  }
}

/**
 * Get metadata by ID
 * @param entityId - Entity ID that owns the metadata
 * @param metadataId - Metadata ID
 * @returns Result with the metadata or error
 */
export async function getMetadata(entityId: UUID4, metadataId: UUID4): Promise<DataResult<Metadata>> {
  try {
    const metadataAtom = getMetadataAtom(entityId);
    const metadataArray = dataStore.get(metadataAtom);
    
    const metadata = metadataArray.find(m => m.id === metadataId);
    if (!metadata) {
      return { success: false, error: `Metadata with ID ${metadataId} not found` };
    }
    
    return { success: true, data: metadata };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to retrieve metadata' };
  }
}

/**
 * Get all metadata for a specific sim/entity
 * @param entityId - Entity ID
 * @returns Result with array of metadata or error
 */
export async function getAllMetadataForEntity(entityId: UUID4): Promise<DataResult<Metadata[]>> {
  try {
    // Check if the sim exists
    const simResult = await getSim(entityId);
    if (!simResult.success) {
      return { success: false, error: `Entity with ID ${entityId} not found` };
    }
    
    const metadataAtom = getMetadataAtom(entityId);
    const metadataArray = dataStore.get(metadataAtom);
    
    return { success: true, data: metadataArray };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to retrieve metadata' };
  }
}

/**
 * Update metadata with validation
 * @param entityId - Entity ID that owns the metadata
 * @param metadataId - Metadata ID to update
 * @param input - Update data
 * @returns Result with the updated metadata or error
 */
export async function updateMetadata(entityId: UUID4, metadataId: UUID4, input: UpdateMetadataInput): Promise<DataResult<Metadata>> {
  try {
    // Validate input
    const validationError = validateMetadataUpdateInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }
    
    // Get existing metadata
    const metadataResult = await getMetadata(entityId, metadataId);
    if (!metadataResult.success || !metadataResult.data) {
      return { success: false, error: metadataResult.error || 'Metadata not found' };
    }
    
    // Update metadata
    const updatedMetadata: Metadata = {
      ...metadataResult.data,
      ...input,
    };
    
    // Update in array
    const metadataAtom = getMetadataAtom(entityId);
    const currentMetadata = dataStore.get(metadataAtom);
    const updatedArray = currentMetadata.map(m => 
      m.id === metadataId ? updatedMetadata : m
    );
    dataStore.set(metadataAtom, updatedArray);
    
    return { success: true, data: updatedMetadata };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update metadata' };
  }
}

/**
 * Delete metadata by ID
 * @param entityId - Entity ID that owns the metadata
 * @param metadataId - Metadata ID to delete
 * @returns Result indicating success or error
 */
export async function deleteMetadata(entityId: UUID4, metadataId: UUID4): Promise<DataResult<void>> {
  try {
    // Check if metadata exists
    const metadataResult = await getMetadata(entityId, metadataId);
    if (!metadataResult.success) {
      return { success: false, error: metadataResult.error };
    }
    
    // Remove from array
    const metadataAtom = getMetadataAtom(entityId);
    const currentMetadata = dataStore.get(metadataAtom);
    const updatedArray = currentMetadata.filter(m => m.id !== metadataId);
    dataStore.set(metadataAtom, updatedArray);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete metadata' };
  }
}

/**
 * Delete all metadata for a specific entity (used in cascading deletes)
 * @param entityId - Entity ID
 * @returns Result indicating success or error
 */
export async function deleteAllMetadataForEntity(entityId: UUID4): Promise<DataResult<void>> {
  try {
    const metadataAtom = getMetadataAtom(entityId);
    const emptyArray: Metadata[] = [];
    dataStore.set(metadataAtom, emptyArray);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete metadata' };
  }
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Check if a sim exists
 * @param id - Sim ID
 * @returns True if sim exists, false otherwise
 */
export async function simExists(id: UUID4): Promise<boolean> {
  const result = await getSim(id);
  return result.success;
}

/**
 * Get metadata count for a sim
 * @param entityId - Entity ID
 * @returns Number of metadata entries for the entity
 */
export async function getMetadataCount(entityId: UUID4): Promise<number> {
  const result = await getAllMetadataForEntity(entityId);
  return result.success ? result.data?.length || 0 : 0;
}

/**
 * Find metadata by key for a specific entity
 * @param entityId - Entity ID
 * @param key - Metadata key to search for
 * @returns Result with the metadata or error
 */
export async function findMetadataByKey(entityId: UUID4, key: string): Promise<DataResult<Metadata | null>> {
  try {
    const result = await getAllMetadataForEntity(entityId);
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }
    
    const metadata = result.data.find(m => m.key === key) || null;
    return { success: true, data: metadata };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to search metadata' };
  }
} 