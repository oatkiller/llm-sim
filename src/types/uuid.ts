import { v4 as uuidv4, validate, version } from 'uuid';

// Brand type for UUID4 validation - ensures type safety
declare const UUID4_BRAND: unique symbol;
export type UUID4 = string & { readonly [UUID4_BRAND]: typeof UUID4_BRAND };

/**
 * Type guard to check if a string is a valid UUID4
 * @param value - String to validate
 * @returns True if the string is a valid UUID4
 */
export function isUUID4(value: string): value is UUID4 {
  return validate(value) && version(value) === 4;
}

/**
 * Generate a new UUID4 string
 * @returns A new UUID4 string with proper branding
 */
export function generateUUID4(): UUID4 {
  const uuid = uuidv4();
  // We know this is a valid UUID4 since we just generated it
  return uuid as UUID4;
}

/**
 * Assert that a string is a UUID4, throwing an error if not
 * @param value - String to validate
 * @param context - Optional context for error message
 * @returns The value cast as UUID4
 * @throws Error if the value is not a valid UUID4
 */
export function assertUUID4(value: string, context?: string): UUID4 {
  if (!isUUID4(value)) {
    throw new Error(`Invalid UUID4${context ? ` in ${context}` : ''}: ${value}`);
  }
  return value;
}

/**
 * Safely convert a string to UUID4, returning null if invalid
 * @param value - String to convert
 * @returns UUID4 if valid, null otherwise
 */
export function toUUID4(value: string): UUID4 | null {
  return isUUID4(value) ? value : null;
} 