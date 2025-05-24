import { describe, it, expect, beforeEach } from 'vitest';
import { 
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
  findMetadataByKey,
  dataStore
} from '../data-access-layer';
import { generateUUID4, type UUID4 } from '../uuid';
import { simIdsAtom } from '../atoms';

describe('Data Access Layer', () => {
  beforeEach(() => {
    // Clear the store before each test
    dataStore.set(simIdsAtom, []);
    // localStorage mock is already cleared globally in test setup
  });

  describe('Sim CRUD Operations', () => {
    describe('createSim', () => {
      it('should create a sim with valid input', async () => {
        const input = { log: 'Test log content' };
        const result = await createSim(input);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.log).toBe('Test log content');
        expect(result.data!.id).toBeDefined();
        expect(result.data!.createdAt).toBeDefined();
        expect(result.data!.updatedAt).toBeDefined();
      });

      it('should create a sim with empty log when no log provided', async () => {
        const input = {};
        const result = await createSim(input);

        expect(result.success).toBe(true);
        expect(result.data!.log).toBe('');
      });

      it('should reject sim with log exceeding maximum length', async () => {
        const longLog = 'a'.repeat(10001); // Exceeds 10,000 character limit
        const input = { log: longLog };
        const result = await createSim(input);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Log content exceeds maximum length');
      });

      it('should add sim ID to the sim IDs list', async () => {
        const input = { log: 'Test' };
        const result = await createSim(input);

        expect(result.success).toBe(true);
        const simIds = dataStore.get(simIdsAtom);
        expect(simIds).toContain(result.data!.id);
      });
    });

    describe('getSim', () => {
      it('should retrieve an existing sim', async () => {
        const createResult = await createSim({ log: 'Test log' });
        const simId = createResult.data!.id;

        const result = await getSim(simId);

        expect(result.success).toBe(true);
        expect(result.data!.id).toBe(simId);
        expect(result.data!.log).toBe('Test log');
      });

      it('should return error for non-existent sim', async () => {
        const fakeId = generateUUID4();
        const result = await getSim(fakeId);

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    describe('getAllSims', () => {
      it('should return empty array when no sims exist', async () => {
        const result = await getAllSims();

        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
      });

      it('should return all created sims', async () => {
        await createSim({ log: 'Sim 1' });
        await createSim({ log: 'Sim 2' });
        await createSim({ log: 'Sim 3' });

        const result = await getAllSims();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data!.map(s => s.log)).toEqual(['Sim 1', 'Sim 2', 'Sim 3']);
      });
    });

    describe('updateSim', () => {
      it('should update sim log content', async () => {
        const createResult = await createSim({ log: 'Original log' });
        const simId = createResult.data!.id;

        const result = await updateSim(simId, { log: 'Updated log' });

        expect(result.success).toBe(true);
        expect(result.data!.log).toBe('Updated log');
        expect(result.data!.updatedAt).toBeGreaterThan(result.data!.createdAt);
      });

      it('should reject update with invalid log length', async () => {
        const createResult = await createSim({ log: 'Original log' });
        const simId = createResult.data!.id;
        const longLog = 'a'.repeat(10001);

        const result = await updateSim(simId, { log: longLog });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Log content exceeds maximum length');
      });

      it('should return error for non-existent sim', async () => {
        const fakeId = generateUUID4();
        const result = await updateSim(fakeId, { log: 'Updated' });

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });

      it('should update timestamp when provided', async () => {
        const createResult = await createSim({ log: 'Original log' });
        const simId = createResult.data!.id;
        const customTimestamp = Date.now() + 1000;

        const result = await updateSim(simId, { 
          log: 'Updated log', 
          updatedAt: customTimestamp 
        });

        expect(result.success).toBe(true);
        expect(result.data!.updatedAt).toBe(customTimestamp);
      });
    });

    describe('deleteSim', () => {
      it('should delete an existing sim', async () => {
        const createResult = await createSim({ log: 'To be deleted' });
        const simId = createResult.data!.id;

        const deleteResult = await deleteSim(simId);
        expect(deleteResult.success).toBe(true);

        const getResult = await getSim(simId);
        expect(getResult.success).toBe(false);
      });

      it('should remove sim ID from the sim IDs list', async () => {
        const createResult = await createSim({ log: 'To be deleted' });
        const simId = createResult.data!.id;

        await deleteSim(simId);

        const simIds = dataStore.get(simIdsAtom);
        expect(simIds).not.toContain(simId);
      });

      it('should return error for non-existent sim', async () => {
        const fakeId = generateUUID4();
        const result = await deleteSim(fakeId);

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });

      it('should cascade delete all metadata for the sim', async () => {
        const createResult = await createSim({ log: 'Sim with metadata' });
        const simId = createResult.data!.id;

        // Add some metadata
        await createMetadata({ entity_id: simId, key: 'name', value: 'Test Sim' });
        await createMetadata({ entity_id: simId, key: 'type', value: 'Test' });

        // Verify metadata exists
        const metadataResult = await getAllMetadataForEntity(simId);
        expect(metadataResult.success).toBe(true);
        expect(metadataResult.data).toHaveLength(2);

        // Delete sim
        const deleteResult = await deleteSim(simId);
        expect(deleteResult.success).toBe(true);

        // Verify metadata is gone
        const metadataAfterDelete = await getAllMetadataForEntity(simId);
        expect(metadataAfterDelete.success).toBe(false);
      });
    });

    describe('simExists', () => {
      it('should return true for existing sim', async () => {
        const createResult = await createSim({ log: 'Existing sim' });
        const simId = createResult.data!.id;

        const exists = await simExists(simId);
        expect(exists).toBe(true);
      });

      it('should return false for non-existent sim', async () => {
        const fakeId = generateUUID4();
        const exists = await simExists(fakeId);
        expect(exists).toBe(false);
      });
    });
  });

  describe('Metadata CRUD Operations', () => {
    let testSimId: UUID4;

    beforeEach(async () => {
      const createResult = await createSim({ log: 'Test sim for metadata' });
      testSimId = createResult.data!.id;
    });

    describe('createMetadata', () => {
      it('should create metadata for existing sim', async () => {
        const input = {
          entity_id: testSimId,
          key: 'name',
          value: 'Test Sim'
        };

        const result = await createMetadata(input);

        expect(result.success).toBe(true);
        expect(result.data!.entity_id).toBe(testSimId);
        expect(result.data!.key).toBe('name');
        expect(result.data!.value).toBe('Test Sim');
        expect(result.data!.id).toBeDefined();
      });

      it('should reject metadata for non-existent sim', async () => {
        const fakeSimId = generateUUID4();
        const input = {
          entity_id: fakeSimId,
          key: 'name',
          value: 'Test'
        };

        const result = await createMetadata(input);

        expect(result.success).toBe(false);
        expect(result.error).toContain('sim with ID');
        expect(result.error).toContain('not found');
      });

      it('should reject metadata with key exceeding maximum length', async () => {
        const longKey = 'a'.repeat(101); // Exceeds 100 character limit
        const input = {
          entity_id: testSimId,
          key: longKey,
          value: 'Test'
        };

        const result = await createMetadata(input);

        expect(result.success).toBe(false);
        expect(result.error).toContain('key exceeds maximum length');
      });

      it('should reject metadata with value exceeding maximum length', async () => {
        const longValue = 'a'.repeat(10001); // Exceeds 10,000 character limit
        const input = {
          entity_id: testSimId,
          key: 'test',
          value: longValue
        };

        const result = await createMetadata(input);

        expect(result.success).toBe(false);
        expect(result.error).toContain('value exceeds maximum length');
      });
    });

    describe('getMetadata', () => {
      it('should retrieve existing metadata', async () => {
        const createResult = await createMetadata({
          entity_id: testSimId,
          key: 'name',
          value: 'Test Sim'
        });
        const metadataId = createResult.data!.id;

        const result = await getMetadata(testSimId, metadataId);

        expect(result.success).toBe(true);
        expect(result.data!.id).toBe(metadataId);
        expect(result.data!.key).toBe('name');
        expect(result.data!.value).toBe('Test Sim');
      });

      it('should return error for non-existent metadata', async () => {
        const fakeMetadataId = generateUUID4();
        const result = await getMetadata(testSimId, fakeMetadataId);

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    describe('getAllMetadataForEntity', () => {
      it('should return empty array for sim with no metadata', async () => {
        const result = await getAllMetadataForEntity(testSimId);

        expect(result.success).toBe(true);
        expect(result.data).toEqual([]);
      });

      it('should return all metadata for a sim', async () => {
        await createMetadata({ entity_id: testSimId, key: 'name', value: 'Test Sim' });
        await createMetadata({ entity_id: testSimId, key: 'type', value: 'Test' });
        await createMetadata({ entity_id: testSimId, key: 'status', value: 'Active' });

        const result = await getAllMetadataForEntity(testSimId);

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data!.map(m => m.key)).toEqual(['name', 'type', 'status']);
      });

      it('should return error for non-existent sim', async () => {
        const fakeSimId = generateUUID4();
        const result = await getAllMetadataForEntity(fakeSimId);

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    describe('updateMetadata', () => {
      it('should update metadata key and value', async () => {
        const createResult = await createMetadata({
          entity_id: testSimId,
          key: 'name',
          value: 'Original Name'
        });
        const metadataId = createResult.data!.id;

        const result = await updateMetadata(testSimId, metadataId, {
          key: 'title',
          value: 'Updated Title'
        });

        expect(result.success).toBe(true);
        expect(result.data!.key).toBe('title');
        expect(result.data!.value).toBe('Updated Title');
      });

      it('should update only key when value not provided', async () => {
        const createResult = await createMetadata({
          entity_id: testSimId,
          key: 'name',
          value: 'Test Value'
        });
        const metadataId = createResult.data!.id;

        const result = await updateMetadata(testSimId, metadataId, {
          key: 'title'
        });

        expect(result.success).toBe(true);
        expect(result.data!.key).toBe('title');
        expect(result.data!.value).toBe('Test Value'); // Should remain unchanged
      });

      it('should reject update with invalid key length', async () => {
        const createResult = await createMetadata({
          entity_id: testSimId,
          key: 'name',
          value: 'Test'
        });
        const metadataId = createResult.data!.id;
        const longKey = 'a'.repeat(101);

        const result = await updateMetadata(testSimId, metadataId, {
          key: longKey
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('key exceeds maximum length');
      });

      it('should return error for non-existent metadata', async () => {
        const fakeMetadataId = generateUUID4();
        const result = await updateMetadata(testSimId, fakeMetadataId, {
          key: 'updated'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    describe('deleteMetadata', () => {
      it('should delete existing metadata', async () => {
        const createResult = await createMetadata({
          entity_id: testSimId,
          key: 'name',
          value: 'To be deleted'
        });
        const metadataId = createResult.data!.id;

        const deleteResult = await deleteMetadata(testSimId, metadataId);
        expect(deleteResult.success).toBe(true);

        const getResult = await getMetadata(testSimId, metadataId);
        expect(getResult.success).toBe(false);
      });

      it('should return error for non-existent metadata', async () => {
        const fakeMetadataId = generateUUID4();
        const result = await deleteMetadata(testSimId, fakeMetadataId);

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });

    describe('deleteAllMetadataForEntity', () => {
      it('should delete all metadata for an entity', async () => {
        await createMetadata({ entity_id: testSimId, key: 'name', value: 'Test' });
        await createMetadata({ entity_id: testSimId, key: 'type', value: 'Test' });

        const deleteResult = await deleteAllMetadataForEntity(testSimId);
        expect(deleteResult.success).toBe(true);

        const getAllResult = await getAllMetadataForEntity(testSimId);
        expect(getAllResult.success).toBe(true);
        expect(getAllResult.data).toEqual([]);
      });
    });

    describe('getMetadataCount', () => {
      it('should return 0 for sim with no metadata', async () => {
        const count = await getMetadataCount(testSimId);
        expect(count).toBe(0);
      });

      it('should return correct count for sim with metadata', async () => {
        await createMetadata({ entity_id: testSimId, key: 'name', value: 'Test' });
        await createMetadata({ entity_id: testSimId, key: 'type', value: 'Test' });
        await createMetadata({ entity_id: testSimId, key: 'status', value: 'Active' });

        const count = await getMetadataCount(testSimId);
        expect(count).toBe(3);
      });

      it('should return 0 for non-existent sim', async () => {
        const fakeSimId = generateUUID4();
        const count = await getMetadataCount(fakeSimId);
        expect(count).toBe(0);
      });
    });

    describe('findMetadataByKey', () => {
      it('should find metadata by key', async () => {
        await createMetadata({ entity_id: testSimId, key: 'name', value: 'Test Sim' });
        await createMetadata({ entity_id: testSimId, key: 'type', value: 'Test' });

        const result = await findMetadataByKey(testSimId, 'name');

        expect(result.success).toBe(true);
        expect(result.data!.key).toBe('name');
        expect(result.data!.value).toBe('Test Sim');
      });

      it('should return null for non-existent key', async () => {
        await createMetadata({ entity_id: testSimId, key: 'name', value: 'Test' });

        const result = await findMetadataByKey(testSimId, 'nonexistent');

        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
      });

      it('should return error for non-existent sim', async () => {
        const fakeSimId = generateUUID4();
        const result = await findMetadataByKey(fakeSimId, 'name');

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete sim lifecycle with metadata', async () => {
      // Create sim
      const createSimResult = await createSim({ log: 'Integration test sim' });
      expect(createSimResult.success).toBe(true);
      const simId = createSimResult.data!.id;

      // Add metadata
      const metadata1 = await createMetadata({
        entity_id: simId,
        key: 'name',
        value: 'Integration Test'
      });
      const metadata2 = await createMetadata({
        entity_id: simId,
        key: 'type',
        value: 'Test'
      });
      expect(metadata1.success).toBe(true);
      expect(metadata2.success).toBe(true);

      // Verify metadata count
      const count = await getMetadataCount(simId);
      expect(count).toBe(2);

      // Update sim
      const updateResult = await updateSim(simId, { log: 'Updated integration test sim' });
      expect(updateResult.success).toBe(true);

      // Update metadata
      const updateMetadataResult = await updateMetadata(simId, metadata1.data!.id, {
        value: 'Updated Integration Test'
      });
      expect(updateMetadataResult.success).toBe(true);

      // Verify all data
      const finalSim = await getSim(simId);
      const finalMetadata = await getAllMetadataForEntity(simId);
      expect(finalSim.data!.log).toBe('Updated integration test sim');
      expect(finalMetadata.data!.find(m => m.key === 'name')!.value).toBe('Updated Integration Test');

      // Delete sim (should cascade delete metadata)
      const deleteResult = await deleteSim(simId);
      expect(deleteResult.success).toBe(true);

      // Verify everything is gone
      const simAfterDelete = await getSim(simId);
      const metadataAfterDelete = await getAllMetadataForEntity(simId);
      expect(simAfterDelete.success).toBe(false);
      expect(metadataAfterDelete.success).toBe(false);
    });
  });
}); 