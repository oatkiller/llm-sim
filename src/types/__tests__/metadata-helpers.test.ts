import { describe, it, expect } from 'vitest';
import {
  createMetadata,
  updateMetadata,
  getMetadataForEntity,
  findMetadataByKey,
  wouldExceedMetadataLimit,
  removeEntityMetadata,
  removeMetadataById,
  getMetadataStats
} from '../metadata-helpers';
import { generateUUID4, type UUID4 } from '../uuid';
import type { Metadata, CreateMetadataInput, UpdateMetadataInput } from '../metadata';

describe('Metadata helper functions', () => {
  const createTestMetadata = (entityId: UUID4, key: string, value: string): Metadata => ({
    id: generateUUID4(),
    entity_id: entityId,
    key,
    value
  });

  describe('createMetadata', () => {
    it('should create valid metadata successfully', () => {
      const input: CreateMetadataInput = {
        entity_id: generateUUID4(),
        key: 'name',
        value: 'John Doe'
      };

      const result = createMetadata(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.entity_id).toBe(input.entity_id);
      expect(result.data!.key).toBe(input.key);
      expect(result.data!.value).toBe(input.value);
      expect(result.data!.id).toBeDefined();
    });

    it('should truncate key if too long', () => {
      const input: CreateMetadataInput = {
        entity_id: generateUUID4(),
        key: 'a'.repeat(150), // too long
        value: 'value'
      };

      const result = createMetadata(input);

      expect(result.success).toBe(true);
      expect(result.data!.key.length).toBe(100);
    });

    it('should truncate value if too long', () => {
      const input: CreateMetadataInput = {
        entity_id: generateUUID4(),
        key: 'key',
        value: 'a'.repeat(15000) // too long
      };

      const result = createMetadata(input);

      expect(result.success).toBe(true);
      expect(result.data!.value.length).toBe(10000);
    });

    it('should handle empty key and value', () => {
      const input: CreateMetadataInput = {
        entity_id: generateUUID4(),
        key: '',
        value: ''
      };

      const result = createMetadata(input);

      expect(result.success).toBe(true);
      expect(result.data!.key).toBe('');
      expect(result.data!.value).toBe('');
    });
  });

  describe('updateMetadata', () => {
    it('should update metadata successfully', () => {
      const existing = createTestMetadata(generateUUID4(), 'name', 'John Doe');
      const updates: UpdateMetadataInput = {
        key: 'fullName',
        value: 'John Smith'
      };

      const result = updateMetadata(existing, updates);

      expect(result.success).toBe(true);
      expect(result.data!.id).toBe(existing.id);
      expect(result.data!.entity_id).toBe(existing.entity_id);
      expect(result.data!.key).toBe('fullName');
      expect(result.data!.value).toBe('John Smith');
    });

    it('should update only specified fields', () => {
      const existing = createTestMetadata(generateUUID4(), 'name', 'John Doe');
      const updates: UpdateMetadataInput = {
        value: 'Jane Doe'
      };

      const result = updateMetadata(existing, updates);

      expect(result.success).toBe(true);
      expect(result.data!.key).toBe('name'); // unchanged
      expect(result.data!.value).toBe('Jane Doe'); // updated
    });

    it('should truncate updated fields if too long', () => {
      const existing = createTestMetadata(generateUUID4(), 'name', 'John Doe');
      const updates: UpdateMetadataInput = {
        key: 'a'.repeat(150),
        value: 'b'.repeat(15000)
      };

      const result = updateMetadata(existing, updates);

      expect(result.success).toBe(true);
      expect(result.data!.key.length).toBe(100);
      expect(result.data!.value.length).toBe(10000);
    });

    it('should handle empty updates', () => {
      const existing = createTestMetadata(generateUUID4(), 'name', 'John Doe');
      const updates: UpdateMetadataInput = {};

      const result = updateMetadata(existing, updates);

      expect(result.success).toBe(true);
      expect(result.data!.key).toBe(existing.key);
      expect(result.data!.value).toBe(existing.value);
    });
  });

  describe('getMetadataForEntity', () => {
    it('should return metadata for specific entity', () => {
      const entityId1 = generateUUID4();
      const entityId2 = generateUUID4();
      
      const metadataList: Metadata[] = [
        createTestMetadata(entityId1, 'name', 'John'),
        createTestMetadata(entityId1, 'age', '30'),
        createTestMetadata(entityId2, 'name', 'Jane'),
        createTestMetadata(entityId1, 'city', 'NYC')
      ];

      const result = getMetadataForEntity(metadataList, entityId1);

      expect(result).toHaveLength(3);
      expect(result.every(m => m.entity_id === entityId1)).toBe(true);
    });

    it('should return empty array for entity with no metadata', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = [
        createTestMetadata(generateUUID4(), 'name', 'John')
      ];

      const result = getMetadataForEntity(metadataList, entityId);

      expect(result).toHaveLength(0);
    });

    it('should handle empty metadata list', () => {
      const entityId = generateUUID4();
      const result = getMetadataForEntity([], entityId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findMetadataByKey', () => {
    it('should find metadata by entity ID and key', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = [
        createTestMetadata(entityId, 'name', 'John'),
        createTestMetadata(entityId, 'age', '30'),
        createTestMetadata(generateUUID4(), 'name', 'Jane')
      ];

      const result = findMetadataByKey(metadataList, entityId, 'name');

      expect(result).not.toBeNull();
      expect(result!.entity_id).toBe(entityId);
      expect(result!.key).toBe('name');
      expect(result!.value).toBe('John');
    });

    it('should return null if not found', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = [
        createTestMetadata(entityId, 'age', '30')
      ];

      const result = findMetadataByKey(metadataList, entityId, 'name');

      expect(result).toBeNull();
    });

    it('should handle empty metadata list', () => {
      const entityId = generateUUID4();
      const result = findMetadataByKey([], entityId, 'name');

      expect(result).toBeNull();
    });
  });

  describe('wouldExceedMetadataLimit', () => {
    it('should return false when under limit', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = Array.from({ length: 10 }, (_, i) =>
        createTestMetadata(entityId, `key${i}`, `value${i}`)
      );

      const result = wouldExceedMetadataLimit(metadataList, entityId);

      expect(result).toBe(false);
    });

    it('should return true when at limit', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = Array.from({ length: 20 }, (_, i) =>
        createTestMetadata(entityId, `key${i}`, `value${i}`)
      );

      const result = wouldExceedMetadataLimit(metadataList, entityId);

      expect(result).toBe(true);
    });

    it('should return true when over limit', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = Array.from({ length: 25 }, (_, i) =>
        createTestMetadata(entityId, `key${i}`, `value${i}`)
      );

      const result = wouldExceedMetadataLimit(metadataList, entityId);

      expect(result).toBe(true);
    });

    it('should only count metadata for specific entity', () => {
      const entityId1 = generateUUID4();
      const entityId2 = generateUUID4();
      
      const metadataList: Metadata[] = [
        ...Array.from({ length: 15 }, (_, i) => createTestMetadata(entityId1, `key${i}`, `value${i}`)),
        ...Array.from({ length: 25 }, (_, i) => createTestMetadata(entityId2, `key${i}`, `value${i}`))
      ];

      expect(wouldExceedMetadataLimit(metadataList, entityId1)).toBe(false);
      expect(wouldExceedMetadataLimit(metadataList, entityId2)).toBe(true);
    });
  });

  describe('removeEntityMetadata', () => {
    it('should remove all metadata for specific entity', () => {
      const entityId1 = generateUUID4();
      const entityId2 = generateUUID4();
      
      const metadataList: Metadata[] = [
        createTestMetadata(entityId1, 'name', 'John'),
        createTestMetadata(entityId1, 'age', '30'),
        createTestMetadata(entityId2, 'name', 'Jane'),
        createTestMetadata(entityId1, 'city', 'NYC')
      ];

      const result = removeEntityMetadata(metadataList, entityId1);

      expect(result).toHaveLength(1);
      expect(result[0].entity_id).toBe(entityId2);
    });

    it('should handle entity with no metadata', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = [
        createTestMetadata(generateUUID4(), 'name', 'John')
      ];

      const result = removeEntityMetadata(metadataList, entityId);

      expect(result).toHaveLength(1);
      expect(result).toEqual(metadataList);
    });

    it('should handle empty metadata list', () => {
      const entityId = generateUUID4();
      const result = removeEntityMetadata([], entityId);

      expect(result).toHaveLength(0);
    });
  });

  describe('removeMetadataById', () => {
    it('should remove specific metadata entry', () => {
      const metadata1 = createTestMetadata(generateUUID4(), 'name', 'John');
      const metadata2 = createTestMetadata(generateUUID4(), 'age', '30');
      const metadataList: Metadata[] = [metadata1, metadata2];

      const result = removeMetadataById(metadataList, metadata1.id);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(metadata2.id);
    });

    it('should handle non-existent ID', () => {
      const metadataList: Metadata[] = [
        createTestMetadata(generateUUID4(), 'name', 'John')
      ];

      const result = removeMetadataById(metadataList, generateUUID4());

      expect(result).toHaveLength(1);
      expect(result).toEqual(metadataList);
    });

    it('should handle empty metadata list', () => {
      const result = removeMetadataById([], generateUUID4());

      expect(result).toHaveLength(0);
    });
  });

  describe('getMetadataStats', () => {
    it('should calculate correct statistics', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = [
        createTestMetadata(entityId, 'name', 'John Doe'), // 4 + 8 = 12 chars
        createTestMetadata(entityId, 'age', '30'), // 3 + 2 = 5 chars
        createTestMetadata(entityId, '', ''), // empty
        createTestMetadata(entityId, 'city', 'New York'), // 4 + 8 = 12 chars
        createTestMetadata(generateUUID4(), 'other', 'value') // different entity
      ];

      const stats = getMetadataStats(metadataList, entityId);

      expect(stats.count).toBe(4);
      expect(stats.hasContent).toBe(3);
      expect(stats.isEmpty).toBe(1);
      expect(stats.totalKeyLength).toBe(11); // 4 + 3 + 0 + 4
      expect(stats.totalValueLength).toBe(18); // 8 + 2 + 0 + 8
      expect(stats.averageKeyLength).toBe(2.75); // 11 / 4
      expect(stats.averageValueLength).toBe(4.5); // 18 / 4
    });

    it('should handle entity with no metadata', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = [
        createTestMetadata(generateUUID4(), 'name', 'John')
      ];

      const stats = getMetadataStats(metadataList, entityId);

      expect(stats.count).toBe(0);
      expect(stats.hasContent).toBe(0);
      expect(stats.isEmpty).toBe(0);
      expect(stats.totalKeyLength).toBe(0);
      expect(stats.totalValueLength).toBe(0);
      expect(stats.averageKeyLength).toBe(0);
      expect(stats.averageValueLength).toBe(0);
    });

    it('should handle empty metadata list', () => {
      const entityId = generateUUID4();
      const stats = getMetadataStats([], entityId);

      expect(stats.count).toBe(0);
      expect(stats.hasContent).toBe(0);
      expect(stats.isEmpty).toBe(0);
      expect(stats.totalKeyLength).toBe(0);
      expect(stats.totalValueLength).toBe(0);
      expect(stats.averageKeyLength).toBe(0);
      expect(stats.averageValueLength).toBe(0);
    });

    it('should correctly identify content vs empty metadata', () => {
      const entityId = generateUUID4();
      const metadataList: Metadata[] = [
        createTestMetadata(entityId, 'name', 'John'),
        createTestMetadata(entityId, '', 'value'), // empty key
        createTestMetadata(entityId, 'key', ''), // empty value
        createTestMetadata(entityId, '   ', '  \n  '), // whitespace only
        createTestMetadata(entityId, 'valid', 'content')
      ];

      const stats = getMetadataStats(metadataList, entityId);

      expect(stats.count).toBe(5);
      expect(stats.hasContent).toBe(2); // only 'name' and 'valid' have real content
      expect(stats.isEmpty).toBe(3);
    });
  });
}); 