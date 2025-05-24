import { atomFamily, atomWithStorage } from 'jotai/utils';
import type { UUID4 } from './uuid';
import type { Sim } from './sim';
import type { Metadata } from './metadata';

/**
 * Storage implementation for localStorage with error handling
 */
const storage = {
  getItem: (key: string, initialValue: any) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Failed to read from localStorage for key ${key}:`, error);
      return initialValue;
    }
  },
  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to write to localStorage for key ${key}:`, error);
      throw error;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from localStorage for key ${key}:`, error);
    }
  }
};

/**
 * AtomFamily for individual sim storage using UUID4 keys
 * Each sim is stored separately for optimal performance
 */
export const simAtomFamily = atomFamily((entityId: UUID4) =>
  atomWithStorage<Sim | null>(`sim-${entityId}`, null, storage, {
    getOnInit: true, // Automatically load from storage on atom creation
  })
);

/**
 * AtomFamily for metadata arrays by entity ID using UUID4 keys
 * All metadata for a sim is stored together for efficient retrieval
 */
export const metadataAtomFamily = atomFamily((entityId: UUID4) =>
  atomWithStorage<Metadata[]>(`metadata-${entityId}`, [], storage, {
    getOnInit: true, // Automatically load from storage on atom creation
  })
);

/**
 * Central atom for tracking all sim IDs
 * This allows us to enumerate all sims without creating individual atoms
 */
export const simIdsAtom = atomWithStorage<UUID4[]>('sim-ids', [], storage, {
  getOnInit: true,
});

/**
 * Lazy accessor function for sim atoms
 * Only creates atom when actually needed
 * @param id - UUID4 of the sim
 * @returns Atom for the specific sim
 */
export function getSimAtom(id: UUID4) {
  return simAtomFamily(id);
}

/**
 * Lazy accessor function for metadata atoms
 * Only creates atom when actually needed
 * @param entityId - UUID4 of the entity whose metadata to access
 * @returns Atom for the entity's metadata array
 */
export function getMetadataAtom(entityId: UUID4) {
  return metadataAtomFamily(entityId);
}

/**
 * Cleanup function to remove atom from family (for memory management)
 * Call this when a sim is permanently deleted
 * @param entityId - UUID4 of the entity to cleanup
 */
export function cleanupSimAtoms(entityId: UUID4) {
  // Remove from storage
  storage.removeItem(`sim-${entityId}`);
  storage.removeItem(`metadata-${entityId}`);
  
  // Note: Jotai atomFamily doesn't have built-in cleanup,
  // but removing from storage prevents stale data
}

/**
 * Type definitions for atom values
 */
export type SimAtom = ReturnType<typeof getSimAtom>;
export type MetadataAtom = ReturnType<typeof getMetadataAtom>;

/**
 * Constants for storage keys and configuration
 */
export const STORAGE_CONFIG = {
  SIM_PREFIX: 'sim-',
  METADATA_PREFIX: 'metadata-',
  SIM_IDS_KEY: 'sim-ids',
  MAX_STORAGE_SIZE: 50 * 1024 * 1024, // 50MB limit
} as const; 