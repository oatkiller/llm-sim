import { describe, it, expect } from 'vitest';
import {
  SIM_CONSTRAINTS,
  isValidLogLength,
  truncateLog,
  getLogPreview,
  hasLogContent,
  type Sim,
  type CreateSimInput,
  type UpdateSimInput
} from '../sim';
import { generateUUID4 } from '../uuid';

describe('Sim types and utilities', () => {
  describe('SIM_CONSTRAINTS', () => {
    it('should have correct constraint values', () => {
      expect(SIM_CONSTRAINTS.MIN_LOG_LENGTH).toBe(0);
      expect(SIM_CONSTRAINTS.MAX_LOG_LENGTH).toBe(10_000);
      expect(SIM_CONSTRAINTS.MAX_SIMS).toBe(10_000);
    });
  });

  describe('isValidLogLength', () => {
    it('should return true for valid log lengths', () => {
      expect(isValidLogLength('')).toBe(true); // minimum length
      expect(isValidLogLength('Hello world')).toBe(true);
      expect(isValidLogLength('a'.repeat(10_000))).toBe(true); // maximum length
    });

    it('should return false for invalid log lengths', () => {
      expect(isValidLogLength('a'.repeat(10_001))).toBe(false); // too long
    });

    it('should handle edge cases', () => {
      expect(isValidLogLength('a'.repeat(9_999))).toBe(true);
      expect(isValidLogLength('a'.repeat(10_000))).toBe(true);
      expect(isValidLogLength('a'.repeat(10_001))).toBe(false);
    });
  });

  describe('truncateLog', () => {
    it('should return original log if within limits', () => {
      const shortLog = 'This is a short log';
      expect(truncateLog(shortLog)).toBe(shortLog);
    });

    it('should truncate log if too long', () => {
      const longLog = 'a'.repeat(10_001);
      const truncated = truncateLog(longLog);
      expect(truncated.length).toBe(10_000);
      expect(truncated).toBe('a'.repeat(10_000));
    });

    it('should handle empty string', () => {
      expect(truncateLog('')).toBe('');
    });

    it('should handle exactly max length', () => {
      const maxLog = 'a'.repeat(10_000);
      expect(truncateLog(maxLog)).toBe(maxLog);
    });
  });

  describe('getLogPreview', () => {
    it('should return full log if shorter than max length', () => {
      const shortLog = 'Short log';
      expect(getLogPreview(shortLog)).toBe(shortLog);
    });

    it('should truncate and add ellipsis if longer than max length', () => {
      const longLog = 'a'.repeat(150);
      const preview = getLogPreview(longLog, 100);
      expect(preview.length).toBe(103); // 100 + '...'
      expect(preview).toBe('a'.repeat(100) + '...');
    });

    it('should use default max length of 100', () => {
      const longLog = 'a'.repeat(150);
      const preview = getLogPreview(longLog);
      expect(preview.length).toBe(103); // 100 + '...'
    });

    it('should handle custom max length', () => {
      const longLog = 'a'.repeat(100);
      const preview = getLogPreview(longLog, 50);
      expect(preview.length).toBe(53); // 50 + '...'
      expect(preview).toBe('a'.repeat(50) + '...');
    });

    it('should handle empty string', () => {
      expect(getLogPreview('')).toBe('');
    });
  });

  describe('hasLogContent', () => {
    const createTestSim = (log: string): Sim => ({
      id: generateUUID4(),
      log,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    it('should return true for sims with content', () => {
      const sim = createTestSim('This sim has content');
      expect(hasLogContent(sim)).toBe(true);
    });

    it('should return false for sims with empty logs', () => {
      const sim = createTestSim('');
      expect(hasLogContent(sim)).toBe(false);
    });

    it('should return false for sims with only whitespace', () => {
      const sim = createTestSim('   \n\t  ');
      expect(hasLogContent(sim)).toBe(false);
    });

    it('should return true for sims with content after trimming', () => {
      const sim = createTestSim('  content  ');
      expect(hasLogContent(sim)).toBe(true);
    });
  });

  describe('Sim interface', () => {
    it('should accept valid sim objects', () => {
      const sim: Sim = {
        id: generateUUID4(),
        log: 'Test log content',
        createdAt: 1640995200000,
        updatedAt: 1640995200000
      };

      expect(sim.id).toBeDefined();
      expect(typeof sim.log).toBe('string');
      expect(typeof sim.createdAt).toBe('number');
      expect(typeof sim.updatedAt).toBe('number');
    });
  });

  describe('CreateSimInput interface', () => {
    it('should accept valid creation input', () => {
      const input: CreateSimInput = {
        log: 'Initial log content'
      };

      expect(input.log).toBe('Initial log content');
    });

    it('should accept empty creation input', () => {
      const input: CreateSimInput = {};
      expect(input.log).toBeUndefined();
    });
  });

  describe('UpdateSimInput interface', () => {
    it('should accept valid update input', () => {
      const input: UpdateSimInput = {
        log: 'Updated log content',
        updatedAt: Date.now()
      };

      expect(input.log).toBe('Updated log content');
      expect(typeof input.updatedAt).toBe('number');
    });

    it('should accept partial update input', () => {
      const input1: UpdateSimInput = { log: 'New log' };
      const input2: UpdateSimInput = { updatedAt: Date.now() };
      const input3: UpdateSimInput = {};

      expect(input1.log).toBe('New log');
      expect(input2.updatedAt).toBeDefined();
      expect(Object.keys(input3)).toHaveLength(0);
    });
  });
}); 