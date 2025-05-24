import type { UUID4 } from './uuid';

/**
 * Metadata interface for flexible key-value data associated with sims
 */
export interface Metadata {
  /** Unique identifier for the metadata entry using UUID4 */
  id: UUID4;
  
  /** Foreign key linking to the Sim.id this metadata belongs to */
  entity_id: UUID4;
  
  /** Metadata field name - 0 to 100 characters */
  key: string;
  
  /** Metadata field value - 0 to 10,000 characters */
  value: string;
}

/**
 * Input type for creating new metadata (excludes generated fields)
 */
export interface CreateMetadataInput {
  /** Foreign key to the sim this metadata belongs to */
  entity_id: UUID4;
  
  /** Metadata field name */
  key: string;
  
  /** Metadata field value */
  value: string;
}

/**
 * Input type for updating existing metadata
 */
export interface UpdateMetadataInput {
  /** Updated metadata field name */
  key?: string;
  
  /** Updated metadata field value */
  value?: string;
}

/**
 * Validation constraints for Metadata data
 */
export const METADATA_CONSTRAINTS = {
  /** Minimum key length */
  MIN_KEY_LENGTH: 0,
  
  /** Maximum key length */
  MAX_KEY_LENGTH: 100,
  
  /** Minimum value length */
  MIN_VALUE_LENGTH: 0,
  
  /** Maximum value length */
  MAX_VALUE_LENGTH: 10_000,
  
  /** Maximum metadata fields per sim (design constraint) */
  MAX_METADATA_PER_SIM: 20,
} as const;

/**
 * Validate metadata key length
 * @param key - Key to validate
 * @returns True if key length is within constraints
 */
export function isValidKeyLength(key: string): boolean {
  return key.length >= METADATA_CONSTRAINTS.MIN_KEY_LENGTH && 
         key.length <= METADATA_CONSTRAINTS.MAX_KEY_LENGTH;
}

/**
 * Validate metadata value length
 * @param value - Value to validate
 * @returns True if value length is within constraints
 */
export function isValidValueLength(value: string): boolean {
  return value.length >= METADATA_CONSTRAINTS.MIN_VALUE_LENGTH && 
         value.length <= METADATA_CONSTRAINTS.MAX_VALUE_LENGTH;
}

/**
 * Validate complete metadata entry
 * @param metadata - Metadata to validate
 * @returns True if all constraints are met
 */
export function isValidMetadata(metadata: CreateMetadataInput | UpdateMetadataInput): boolean {
  if ('key' in metadata && metadata.key !== undefined) {
    if (!isValidKeyLength(metadata.key)) return false;
  }
  
  if ('value' in metadata && metadata.value !== undefined) {
    if (!isValidValueLength(metadata.value)) return false;
  }
  
  return true;
}

/**
 * Truncate key to maximum length if needed
 * @param key - Key to truncate
 * @returns Truncated key
 */
export function truncateKey(key: string): string {
  if (key.length <= METADATA_CONSTRAINTS.MAX_KEY_LENGTH) {
    return key;
  }
  return key.substring(0, METADATA_CONSTRAINTS.MAX_KEY_LENGTH);
}

/**
 * Truncate value to maximum length if needed
 * @param value - Value to truncate
 * @returns Truncated value
 */
export function truncateValue(value: string): string {
  if (value.length <= METADATA_CONSTRAINTS.MAX_VALUE_LENGTH) {
    return value;
  }
  return value.substring(0, METADATA_CONSTRAINTS.MAX_VALUE_LENGTH);
}

/**
 * Get a preview of metadata value for display in lists
 * @param value - Full metadata value
 * @param maxLength - Maximum preview length (default 50)
 * @returns Truncated preview with ellipsis if needed
 */
export function getValuePreview(value: string, maxLength: number = 50): string {
  if (value.length <= maxLength) {
    return value;
  }
  return value.substring(0, maxLength) + '...';
}

/**
 * Check if metadata has meaningful content
 * @param metadata - Metadata to check
 * @returns True if both key and value have non-empty content
 */
export function hasMetadataContent(metadata: Metadata): boolean {
  return metadata.key.trim().length > 0 && metadata.value.trim().length > 0;
} 