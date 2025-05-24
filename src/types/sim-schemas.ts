import { z } from 'zod';
import { SIM_CONSTRAINTS } from './sim';

/**
 * Zod schema for UUID4 validation
 */
const uuid4Schema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  'Must be a valid UUID4'
);

/**
 * Zod schema for validating Sim objects
 */
export const SimSchema = z.object({
  id: uuid4Schema.describe('Unique UUID4 identifier for the sim'),
  log: z.string()
    .min(SIM_CONSTRAINTS.MIN_LOG_LENGTH, `Log must be at least ${SIM_CONSTRAINTS.MIN_LOG_LENGTH} characters`)
    .max(SIM_CONSTRAINTS.MAX_LOG_LENGTH, `Log must be at most ${SIM_CONSTRAINTS.MAX_LOG_LENGTH} characters`)
    .describe('Main content area for the sim'),
  createdAt: z.number()
    .int('Created timestamp must be an integer')
    .positive('Created timestamp must be positive')
    .describe('Unix timestamp when the sim was created'),
  updatedAt: z.number()
    .int('Updated timestamp must be an integer')
    .positive('Updated timestamp must be positive')
    .describe('Unix timestamp when the sim was last updated'),
});

/**
 * Zod schema for validating CreateSimInput
 */
export const CreateSimInputSchema = z.object({
  log: z.string()
    .min(SIM_CONSTRAINTS.MIN_LOG_LENGTH, `Log must be at least ${SIM_CONSTRAINTS.MIN_LOG_LENGTH} characters`)
    .max(SIM_CONSTRAINTS.MAX_LOG_LENGTH, `Log must be at most ${SIM_CONSTRAINTS.MAX_LOG_LENGTH} characters`)
    .optional()
    .default('')
    .describe('Initial log content'),
});

/**
 * Zod schema for validating UpdateSimInput
 */
export const UpdateSimInputSchema = z.object({
  log: z.string()
    .min(SIM_CONSTRAINTS.MIN_LOG_LENGTH, `Log must be at least ${SIM_CONSTRAINTS.MIN_LOG_LENGTH} characters`)
    .max(SIM_CONSTRAINTS.MAX_LOG_LENGTH, `Log must be at most ${SIM_CONSTRAINTS.MAX_LOG_LENGTH} characters`)
    .optional()
    .describe('Updated log content'),
  updatedAt: z.number()
    .int('Updated timestamp must be an integer')
    .positive('Updated timestamp must be positive')
    .optional()
    .describe('Updated timestamp'),
});

/**
 * Type definitions derived from Zod schemas
 */
export type SimSchemaType = z.infer<typeof SimSchema>;
export type CreateSimInputSchemaType = z.infer<typeof CreateSimInputSchema>;
export type UpdateSimInputSchemaType = z.infer<typeof UpdateSimInputSchema>; 