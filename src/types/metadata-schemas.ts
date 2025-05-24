import { z } from 'zod';
import { METADATA_CONSTRAINTS } from './metadata';

/**
 * Zod schema for UUID4 validation
 */
const uuid4Schema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  'Must be a valid UUID4'
);

/**
 * Zod schema for validating Metadata objects
 */
export const MetadataSchema = z.object({
  id: uuid4Schema.describe('Unique UUID4 identifier for the metadata entry'),
  entity_id: uuid4Schema.describe('Foreign key linking to the Sim.id this metadata belongs to'),
  key: z.string()
    .min(METADATA_CONSTRAINTS.MIN_KEY_LENGTH, `Key must be at least ${METADATA_CONSTRAINTS.MIN_KEY_LENGTH} characters`)
    .max(METADATA_CONSTRAINTS.MAX_KEY_LENGTH, `Key must be at most ${METADATA_CONSTRAINTS.MAX_KEY_LENGTH} characters`)
    .describe('Metadata field name'),
  value: z.string()
    .min(METADATA_CONSTRAINTS.MIN_VALUE_LENGTH, `Value must be at least ${METADATA_CONSTRAINTS.MIN_VALUE_LENGTH} characters`)
    .max(METADATA_CONSTRAINTS.MAX_VALUE_LENGTH, `Value must be at most ${METADATA_CONSTRAINTS.MAX_VALUE_LENGTH} characters`)
    .describe('Metadata field value'),
});

/**
 * Zod schema for validating CreateMetadataInput
 */
export const CreateMetadataInputSchema = z.object({
  entity_id: uuid4Schema.describe('Foreign key to the sim this metadata belongs to'),
  key: z.string()
    .min(METADATA_CONSTRAINTS.MIN_KEY_LENGTH, `Key must be at least ${METADATA_CONSTRAINTS.MIN_KEY_LENGTH} characters`)
    .max(METADATA_CONSTRAINTS.MAX_KEY_LENGTH, `Key must be at most ${METADATA_CONSTRAINTS.MAX_KEY_LENGTH} characters`)
    .describe('Metadata field name'),
  value: z.string()
    .min(METADATA_CONSTRAINTS.MIN_VALUE_LENGTH, `Value must be at least ${METADATA_CONSTRAINTS.MIN_VALUE_LENGTH} characters`)
    .max(METADATA_CONSTRAINTS.MAX_VALUE_LENGTH, `Value must be at most ${METADATA_CONSTRAINTS.MAX_VALUE_LENGTH} characters`)
    .describe('Metadata field value'),
});

/**
 * Zod schema for validating UpdateMetadataInput
 */
export const UpdateMetadataInputSchema = z.object({
  key: z.string()
    .min(METADATA_CONSTRAINTS.MIN_KEY_LENGTH, `Key must be at least ${METADATA_CONSTRAINTS.MIN_KEY_LENGTH} characters`)
    .max(METADATA_CONSTRAINTS.MAX_KEY_LENGTH, `Key must be at most ${METADATA_CONSTRAINTS.MAX_KEY_LENGTH} characters`)
    .optional()
    .describe('Updated metadata field name'),
  value: z.string()
    .min(METADATA_CONSTRAINTS.MIN_VALUE_LENGTH, `Value must be at least ${METADATA_CONSTRAINTS.MIN_VALUE_LENGTH} characters`)
    .max(METADATA_CONSTRAINTS.MAX_VALUE_LENGTH, `Value must be at most ${METADATA_CONSTRAINTS.MAX_VALUE_LENGTH} characters`)
    .optional()
    .describe('Updated metadata field value'),
});

/**
 * Zod schema for arrays of metadata
 */
export const MetadataArraySchema = z.array(MetadataSchema);

/**
 * Type definitions derived from Zod schemas
 */
export type MetadataSchemaType = z.infer<typeof MetadataSchema>;
export type CreateMetadataInputSchemaType = z.infer<typeof CreateMetadataInputSchema>;
export type UpdateMetadataInputSchemaType = z.infer<typeof UpdateMetadataInputSchema>;
export type MetadataArraySchemaType = z.infer<typeof MetadataArraySchema>; 