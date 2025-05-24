import type { UUID4 } from './uuid';

/**
 * Core Sim/Entity interface representing a simulation entity
 */
export interface Sim {
  /** Unique identifier for the sim using UUID4 */
  id: UUID4;
  
  /** Main content area for the sim - 0 to 10,000 characters */
  log: string;
  
  /** Unix timestamp when the sim was created */
  createdAt: number;
  
  /** Unix timestamp when the sim was last updated */
  updatedAt: number;
}

/**
 * Input type for creating a new sim (excludes generated fields)
 */
export interface CreateSimInput {
  /** Initial log content (optional, defaults to empty string) */
  log?: string;
}

/**
 * Input type for updating an existing sim
 */
export interface UpdateSimInput {
  /** Updated log content */
  log?: string;
  
  /** Updated timestamp (auto-generated if not provided) */
  updatedAt?: number;
}

/**
 * Validation constraints for Sim data
 */
export const SIM_CONSTRAINTS = {
  /** Minimum log length */
  MIN_LOG_LENGTH: 0,
  
  /** Maximum log length */
  MAX_LOG_LENGTH: 10_000,
  
  /** Maximum number of sims (system limit) */
  MAX_SIMS: 10_000,
} as const;

/**
 * Validate log content length
 * @param log - Log content to validate
 * @returns True if log length is within constraints
 */
export function isValidLogLength(log: string): boolean {
  return log.length >= SIM_CONSTRAINTS.MIN_LOG_LENGTH && 
         log.length <= SIM_CONSTRAINTS.MAX_LOG_LENGTH;
}

/**
 * Truncate log content to maximum length if needed
 * @param log - Log content to truncate
 * @returns Truncated log content
 */
export function truncateLog(log: string): string {
  if (log.length <= SIM_CONSTRAINTS.MAX_LOG_LENGTH) {
    return log;
  }
  return log.substring(0, SIM_CONSTRAINTS.MAX_LOG_LENGTH);
}

/**
 * Get a preview of log content for display in lists
 * @param log - Full log content
 * @param maxLength - Maximum preview length (default 100)
 * @returns Truncated preview with ellipsis if needed
 */
export function getLogPreview(log: string, maxLength: number = 100): string {
  if (log.length <= maxLength) {
    return log;
  }
  return log.substring(0, maxLength) + '...';
}

/**
 * Check if a sim has any log content
 * @param sim - Sim to check
 * @returns True if sim has non-empty log content
 */
export function hasLogContent(sim: Sim): boolean {
  return sim.log.trim().length > 0;
} 