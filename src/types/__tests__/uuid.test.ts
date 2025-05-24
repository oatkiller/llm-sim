import { describe, it, expect } from 'vitest';
import { 
  isUUID4, 
  generateUUID4, 
  assertUUID4, 
  toUUID4,
  type UUID4 
} from '../uuid';

describe('UUID4 utilities', () => {
  describe('generateUUID4', () => {
    it('should generate a valid UUID4', () => {
      const uuid = generateUUID4();
      expect(typeof uuid).toBe('string');
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID4();
      const uuid2 = generateUUID4();
      expect(uuid1).not.toBe(uuid2);
    });

    it('should generate UUIDs that pass isUUID4 validation', () => {
      const uuid = generateUUID4();
      expect(isUUID4(uuid)).toBe(true);
    });
  });

  describe('isUUID4', () => {
    it('should return true for valid UUID4 strings', () => {
      const validUUID4 = '550e8400-e29b-41d4-a716-446655440000';
      expect(isUUID4(validUUID4)).toBe(true);
    });

    it('should return false for invalid UUID strings', () => {
      expect(isUUID4('invalid-uuid')).toBe(false);
      expect(isUUID4('550e8400-e29b-31d4-a716-446655440000')).toBe(false); // version 3, not 4
      expect(isUUID4('550e8400-e29b-51d4-a716-446655440000')).toBe(false); // version 5, not 4
      expect(isUUID4('')).toBe(false);
      expect(isUUID4('not-a-uuid-at-all')).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      expect(isUUID4(null as any)).toBe(false);
      expect(isUUID4(undefined as any)).toBe(false);
      expect(isUUID4(123 as any)).toBe(false);
      expect(isUUID4({} as any)).toBe(false);
    });
  });

  describe('assertUUID4', () => {
    it('should return the UUID4 for valid input', () => {
      const validUUID4 = '550e8400-e29b-41d4-a716-446655440000';
      const result = assertUUID4(validUUID4);
      expect(result).toBe(validUUID4);
    });

    it('should throw error for invalid UUID4', () => {
      expect(() => assertUUID4('invalid-uuid')).toThrow('Invalid UUID4: invalid-uuid');
    });

    it('should include context in error message when provided', () => {
      expect(() => assertUUID4('invalid-uuid', 'user creation')).toThrow(
        'Invalid UUID4 in user creation: invalid-uuid'
      );
    });

    it('should throw for non-UUID4 versions', () => {
      expect(() => assertUUID4('550e8400-e29b-31d4-a716-446655440000')).toThrow();
    });
  });

  describe('toUUID4', () => {
    it('should return UUID4 for valid input', () => {
      const validUUID4 = '550e8400-e29b-41d4-a716-446655440000';
      const result = toUUID4(validUUID4);
      expect(result).toBe(validUUID4);
    });

    it('should return null for invalid input', () => {
      expect(toUUID4('invalid-uuid')).toBeNull();
      expect(toUUID4('550e8400-e29b-31d4-a716-446655440000')).toBeNull(); // version 3
      expect(toUUID4('')).toBeNull();
    });

    it('should handle edge cases gracefully', () => {
      expect(toUUID4('not-a-uuid-at-all')).toBeNull();
      expect(toUUID4('550e8400-e29b-41d4-a716-44665544000')).toBeNull(); // too short
      expect(toUUID4('550e8400-e29b-41d4-a716-4466554400000')).toBeNull(); // too long
    });
  });

  describe('type safety', () => {
    it('should maintain type safety with brand typing', () => {
      const uuid = generateUUID4();
      // This test ensures the brand typing works at compile time
      // The UUID4 type should prevent regular strings from being used
      expect(typeof uuid).toBe('string');
      
      // Test that the branded type can be used where UUID4 is expected
      function acceptsUUID4(id: UUID4): string {
        return `ID: ${id}`;
      }
      
      expect(() => acceptsUUID4(uuid)).not.toThrow();
    });
  });
}); 