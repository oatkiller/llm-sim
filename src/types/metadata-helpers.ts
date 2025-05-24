import type { UUID4 } from './uuid';
import { generateUUID4 } from './uuid';
import type { 
  Metadata, 
  CreateMetadataInput, 
  UpdateMetadataInput 
} from './metadata';
import { 
  isValidMetadata, 
  truncateKey, 
  truncateValue,
  METADATA_CONSTRAINTS 
} from './metadata';

/**
 * Result type for metadata operations
 */
export interface MetadataOperationResult<T = Metadata> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new metadata entry with validation
 * @param input - Metadata creation input
 * @returns Operation result with created metadata or error
 */
export function createMetadata(input: CreateMetadataInput): MetadataOperationResult<Metadata> {
  // Validate input
  if (!isValidMetadata(input)) {
    return {
      success: false,
      error: 'Invalid metadata: key or value length exceeds constraints'
    };
  }
  
  // Ensure key and value are within constraints (truncate if needed)
  const metadata: Metadata = {
    id: generateUUID4(),
    entity_id: input.entity_id,
    key: truncateKey(input.key),
    value: truncateValue(input.value)
  };
  
  return {
    success: true,
    data: metadata
  };
}

/**
 * Update an existing metadata entry
 * @param existing - Current metadata to update
 * @param updates - Fields to update
 * @returns Operation result with updated metadata or error
 */
export function updateMetadata(
  existing: Metadata, 
  updates: UpdateMetadataInput
): MetadataOperationResult<Metadata> {
  // Validate updates
  if (!isValidMetadata(updates)) {
    return {
      success: false,
      error: 'Invalid metadata updates: key or value length exceeds constraints'
    };
  }
  
  // Apply updates with truncation
  const updated: Metadata = {
    ...existing,
    key: updates.key !== undefined ? truncateKey(updates.key) : existing.key,
    value: updates.value !== undefined ? truncateValue(updates.value) : existing.value
  };
  
  return {
    success: true,
    data: updated
  };
}

/**
 * Filter metadata entries by entity ID
 * @param metadataList - Array of all metadata entries
 * @param entityId - Entity ID to filter by
 * @returns Array of metadata entries for the specified entity
 */
export function getMetadataForEntity(
  metadataList: Metadata[], 
  entityId: UUID4
): Metadata[] {
  return metadataList.filter(metadata => metadata.entity_id === entityId);
}

/**
 * Find metadata by entity ID and key
 * @param metadataList - Array of all metadata entries
 * @param entityId - Entity ID to search in
 * @param key - Metadata key to find
 * @returns Metadata entry if found, null otherwise
 */
export function findMetadataByKey(
  metadataList: Metadata[], 
  entityId: UUID4, 
  key: string
): Metadata | null {
  return metadataList.find(
    metadata => metadata.entity_id === entityId && metadata.key === key
  ) || null;
}

/**
 * Check if adding more metadata would exceed the per-sim limit
 * @param metadataList - Array of all metadata entries
 * @param entityId - Entity ID to check
 * @returns True if the limit would be exceeded
 */
export function wouldExceedMetadataLimit(
  metadataList: Metadata[], 
  entityId: UUID4
): boolean {
  const entityMetadata = getMetadataForEntity(metadataList, entityId);
  return entityMetadata.length >= METADATA_CONSTRAINTS.MAX_METADATA_PER_SIM;
}

/**
 * Remove metadata entries for a specific entity (cascade delete)
 * @param metadataList - Array of all metadata entries
 * @param entityId - Entity ID whose metadata should be removed
 * @returns Array of metadata entries with entity metadata removed
 */
export function removeEntityMetadata(
  metadataList: Metadata[], 
  entityId: UUID4
): Metadata[] {
  return metadataList.filter(metadata => metadata.entity_id !== entityId);
}

/**
 * Remove a specific metadata entry by ID
 * @param metadataList - Array of all metadata entries
 * @param metadataId - ID of metadata entry to remove
 * @returns Array of metadata entries with specified entry removed
 */
export function removeMetadataById(
  metadataList: Metadata[], 
  metadataId: UUID4
): Metadata[] {
  return metadataList.filter(metadata => metadata.id !== metadataId);
}

/**
 * Get metadata statistics for an entity
 * @param metadataList - Array of all metadata entries
 * @param entityId - Entity ID to analyze
 * @returns Statistics about the entity's metadata
 */
export function getMetadataStats(
  metadataList: Metadata[], 
  entityId: UUID4
): {
  count: number;
  hasContent: number;
  isEmpty: number;
  totalKeyLength: number;
  totalValueLength: number;
  averageKeyLength: number;
  averageValueLength: number;
} {
  const entityMetadata = getMetadataForEntity(metadataList, entityId);
  
  const hasContent = entityMetadata.filter(m => 
    m.key.trim().length > 0 && m.value.trim().length > 0
  ).length;
  
  const totalKeyLength = entityMetadata.reduce((sum, m) => sum + m.key.length, 0);
  const totalValueLength = entityMetadata.reduce((sum, m) => sum + m.value.length, 0);
  
  return {
    count: entityMetadata.length,
    hasContent,
    isEmpty: entityMetadata.length - hasContent,
    totalKeyLength,
    totalValueLength,
    averageKeyLength: entityMetadata.length > 0 ? totalKeyLength / entityMetadata.length : 0,
    averageValueLength: entityMetadata.length > 0 ? totalValueLength / entityMetadata.length : 0
  };
} 