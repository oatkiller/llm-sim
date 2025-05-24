import { describe, it, expect } from 'vitest';
import {
  METADATA_CONSTRAINTS,
  isValidKeyLength,
  isValidValueLength,
  isValidMetadata,
  truncateKey,
  truncateValue,
  getValuePreview,
  hasMetadataContent,
  type Metadata,
  type CreateMetadataInput,
  type UpdateMetadataInput
} from '../metadata';
import { generateUUID4 } from '../uuid';

describe('Metadata types and utilities', () => {
  describe('METADATA_CONSTRAINTS', () => {
    it('should have correct constraint values', () => {
      expect(METADATA_CONSTRAINTS.MIN_KEY_LENGTH).toBe(0);
      expect(METADATA_CONSTRAINTS.MAX_KEY_LENGTH).toBe(100);
      expect(METADATA_CONSTRAINTS.MIN_VALUE_LENGTH).toBe(0);
      expect(METADATA_CONSTRAINTS.MAX_VALUE_LENGTH).toBe(10_000);
      expect(METADATA_CONSTRAINTS.MAX_METADATA_PER_SIM).toBe(20);
    });
  });

  describe('isValidKeyLength', () => {
    it('should return true for valid key lengths', () => {
      expect(isValidKeyLength('')).toBe(true); // minimum length
      expect(isValidKeyLength('name')).toBe(true);
      expect(isValidKeyLength('a'.repeat(100))).toBe(true); // maximum length
    });

    it('should return false for invalid key lengths', () => {
      expect(isValidKeyLength('a'.repeat(101))).toBe(false); // too long
    });

    it('should handle edge cases', () => {
      expect(isValidKeyLength('a'.repeat(99))).toBe(true);
      expect(isValidKeyLength('a'.repeat(100))).toBe(true);
      expect(isValidKeyLength('a'.repeat(101))).toBe(false);
    });
  });

  describe('isValidValueLength', () => {
    it('should return true for valid value lengths', () => {
      expect(isValidValueLength('')).toBe(true); // minimum length
      expect(isValidValueLength('Some value')).toBe(true);
      expect(isValidValueLength('a'.repeat(10_000))).toBe(true); // maximum length
    });

    it('should return false for invalid value lengths', () => {
      expect(isValidValueLength('a'.repeat(10_001))).toBe(false); // too long
    });

    it('should handle edge cases', () => {
      expect(isValidValueLength('a'.repeat(9_999))).toBe(true);
      expect(isValidValueLength('a'.repeat(10_000))).toBe(true);
      expect(isValidValueLength('a'.repeat(10_001))).toBe(false);
    });
  });

  describe('isValidMetadata', () => {
    it('should return true for valid CreateMetadataInput', () => {
      const input: CreateMetadataInput = {
        entity_id: generateUUID4(),
        key: 'name',
        value: 'John Doe'
      };
      expect(isValidMetadata(input)).toBe(true);
    });

    it('should return true for valid UpdateMetadataInput', () => {
      const input: UpdateMetadataInput = {
        key: 'name',
        value: 'Jane Doe'
      };
      expect(isValidMetadata(input)).toBe(true);
    });

    it('should return false for invalid key length', () => {
      const input: CreateMetadataInput = {
        entity_id: generateUUID4(),
        key: 'a'.repeat(101), // too long
        value: 'value'
      };
      expect(isValidMetadata(input)).toBe(false);
    });

    it('should return false for invalid value length', () => {
      const input: CreateMetadataInput = {
        entity_id: generateUUID4(),
        key: 'key',
        value: 'a'.repeat(10_001) // too long
      };
      expect(isValidMetadata(input)).toBe(false);
    });

    it('should handle partial UpdateMetadataInput', () => {
      expect(isValidMetadata({ key: 'valid' })).toBe(true);
      expect(isValidMetadata({ value: 'valid' })).toBe(true);
      expect(isValidMetadata({})).toBe(true);
      expect(isValidMetadata({ key: 'a'.repeat(101) })).toBe(false);
    });
  });

  describe('truncateKey', () => {
    it('should return original key if within limits', () => {
      const shortKey = 'name';
      expect(truncateKey(shortKey)).toBe(shortKey);
    });

    it('should truncate key if too long', () => {
      const longKey = 'a'.repeat(101);
      const truncated = truncateKey(longKey);
      expect(truncated.length).toBe(100);
      expect(truncated).toBe('a'.repeat(100));
    });

    it('should handle empty string', () => {
      expect(truncateKey('')).toBe('');
    });

    it('should handle exactly max length', () => {
      const maxKey = 'a'.repeat(100);
      expect(truncateKey(maxKey)).toBe(maxKey);
    });
  });

  describe('truncateValue', () => {
    it('should return original value if within limits', () => {
      const shortValue = 'Some value';
      expect(truncateValue(shortValue)).toBe(shortValue);
    });

    it('should truncate value if too long', () => {
      const longValue = 'a'.repeat(10_001);
      const truncated = truncateValue(longValue);
      expect(truncated.length).toBe(10_000);
      expect(truncated).toBe('a'.repeat(10_000));
    });

    it('should handle empty string', () => {
      expect(truncateValue('')).toBe('');
    });

    it('should handle exactly max length', () => {
      const maxValue = 'a'.repeat(10_000);
      expect(truncateValue(maxValue)).toBe(maxValue);
    });
  });

  describe('getValuePreview', () => {
    it('should return full value if shorter than max length', () => {
      const shortValue = 'Short value';
      expect(getValuePreview(shortValue)).toBe(shortValue);
    });

    it('should truncate and add ellipsis if longer than max length', () => {
      const longValue = 'a'.repeat(80);
      const preview = getValuePreview(longValue, 50);
      expect(preview.length).toBe(53); // 50 + '...'
      expect(preview).toBe('a'.repeat(50) + '...');
    });

    it('should use default max length of 50', () => {
      const longValue = 'a'.repeat(80);
      const preview = getValuePreview(longValue);
      expect(preview.length).toBe(53); // 50 + '...'
    });

    it('should handle custom max length', () => {
      const longValue = 'a'.repeat(100);
      const preview = getValuePreview(longValue, 30);
      expect(preview.length).toBe(33); // 30 + '...'
      expect(preview).toBe('a'.repeat(30) + '...');
    });

    it('should handle empty string', () => {
      expect(getValuePreview('')).toBe('');
    });
  });

  describe('hasMetadataContent', () => {
    const createTestMetadata = (key: string, value: string): Metadata => ({
      id: generateUUID4(),
      entity_id: generateUUID4(),
      key,
      value
    });

    it('should return true for metadata with content', () => {
      const metadata = createTestMetadata('name', 'John Doe');
      expect(hasMetadataContent(metadata)).toBe(true);
    });

    it('should return false for metadata with empty key', () => {
      const metadata = createTestMetadata('', 'John Doe');
      expect(hasMetadataContent(metadata)).toBe(false);
    });

    it('should return false for metadata with empty value', () => {
      const metadata = createTestMetadata('name', '');
      expect(hasMetadataContent(metadata)).toBe(false);
    });

    it('should return false for metadata with only whitespace', () => {
      const metadata1 = createTestMetadata('   ', 'value');
      const metadata2 = createTestMetadata('key', '   \n\t  ');
      expect(hasMetadataContent(metadata1)).toBe(false);
      expect(hasMetadataContent(metadata2)).toBe(false);
    });

    it('should return true for metadata with content after trimming', () => {
      const metadata = createTestMetadata('  name  ', '  John Doe  ');
      expect(hasMetadataContent(metadata)).toBe(true);
    });
  });

  describe('Metadata interface', () => {
    it('should accept valid metadata objects', () => {
      const metadata: Metadata = {
        id: generateUUID4(),
        entity_id: generateUUID4(),
        key: 'name',
        value: 'John Doe'
      };

      expect(metadata.id).toBeDefined();
      expect(metadata.entity_id).toBeDefined();
      expect(typeof metadata.key).toBe('string');
      expect(typeof metadata.value).toBe('string');
    });
  });

  describe('CreateMetadataInput interface', () => {
    it('should accept valid creation input', () => {
      const input: CreateMetadataInput = {
        entity_id: generateUUID4(),
        key: 'name',
        value: 'John Doe'
      };

      expect(input.entity_id).toBeDefined();
      expect(input.key).toBe('name');
      expect(input.value).toBe('John Doe');
    });
  });

  describe('UpdateMetadataInput interface', () => {
    it('should accept valid update input', () => {
      const input: UpdateMetadataInput = {
        key: 'name',
        value: 'Jane Doe'
      };

      expect(input.key).toBe('name');
      expect(input.value).toBe('Jane Doe');
    });

    it('should accept partial update input', () => {
      const input1: UpdateMetadataInput = { key: 'newKey' };
      const input2: UpdateMetadataInput = { value: 'newValue' };
      const input3: UpdateMetadataInput = {};

      expect(input1.key).toBe('newKey');
      expect(input2.value).toBe('newValue');
      expect(Object.keys(input3)).toHaveLength(0);
    });
  });
}); 