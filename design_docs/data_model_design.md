# Sim Data Model and Types - Design Document

## Overview
This document outlines the design and implementation approach for the core data models and TypeScript types used in the Sim System. The design emphasizes atomic state management using Jotai's atomFamily pattern with persistent storage.

## Core Architecture

### AtomFamily Storage Pattern
The system uses Jotai's `atomFamily` pattern with UUID4 keys to create isolated storage atoms for each entity:

```typescript
// Create an atomFamily that accepts a UUID4 string and creates a storage atom
const simAtomFamily = atomFamily((entityId: UUID4) => 
  atomWithStorage(`sim-${entityId}`, null, storage)
);

const metadataAtomFamily = atomFamily((entityId: UUID4) => 
  atomWithStorage(`metadata-${entityId}`, [], storage)
);
```

### Key Design Principles

1. **Lazy AtomFamily Calls**: All atomFamily instances should be called lazily throughout the application to optimize performance and memory usage.

2. **UUID4-Based Keys**: Every atom is keyed by a UUID4 string, ensuring unique identification and avoiding collisions.

3. **Storage Persistence**: Use `getOnInit` pattern with atomFamily to automatically persist data to localStorage while maintaining atomic state benefits.

4. **Type Safety**: Strict TypeScript typing for all data structures and UUID4 validation.

## Data Models

### Sim/Entity Interface
```typescript
interface Sim {
  id: UUID4;           // Unique identifier
  log: string;         // 0-10,000 characters
  createdAt: number;   // Unix timestamp
  updatedAt: number;   // Unix timestamp
}
```

### Metadata Interface
```typescript
interface Metadata {
  id: UUID4;           // Unique identifier
  entity_id: UUID4;    // Foreign key to Sim.id
  key: string;         // 0-100 characters - metadata field name
  value: string;       // 0-10,000 characters - metadata field value
}
```

### UUID4 Type Definition
```typescript
// Brand type for UUID4 validation
type UUID4 = string & { readonly brand: unique symbol };

// UUID4 validation and generation functions
function isUUID4(value: string): value is UUID4;
function generateUUID4(): UUID4;
```

## Implementation Strategy

### 1. AtomFamily Setup
- Create atomFamily instances for sims and metadata using UUID4 keys
- Implement `getOnInit` pattern for automatic storage persistence
- Ensure lazy evaluation of atoms throughout the application

### 2. Storage Architecture
- Use localStorage as the persistence layer
- Implement storage adapters that work with Jotai's atomWithStorage
- Add compression and size monitoring for the 50MB storage limit

### 3. Metadata Management
- Each Sim can have multiple metadata entries
- Metadata is stored separately but linked via entity_id
- Support for CRUD operations on metadata with type safety

### 4. Helper Functions
```typescript
// Lazy atom accessors
function getSimAtom(id: UUID4) {
  return simAtomFamily(id);
}

function getMetadataAtom(entityId: UUID4) {
  return metadataAtomFamily(entityId);
}

// Metadata CRUD operations
function addMetadata(entityId: UUID4, key: string, value: string): Promise<Metadata>;
function updateMetadata(metadataId: UUID4, updates: Partial<Metadata>): Promise<Metadata>;
function deleteMetadata(metadataId: UUID4): Promise<void>;
function getMetadataByKey(entityId: UUID4, key: string): Promise<Metadata | null>;
```

## Performance Considerations

### Lazy Loading
- AtomFamily calls are made lazily to avoid creating unnecessary atoms
- Only instantiate atoms when data is actually needed
- Use React's useMemo and useCallback for expensive operations

### Memory Management
- Implement atom cleanup for deleted entities
- Monitor total storage usage and implement cleanup strategies
- Use weak references where appropriate to prevent memory leaks

### Storage Optimization
- Compress data before storing in localStorage
- Implement batching for multiple updates
- Add storage quota monitoring and cleanup

## Validation and Constraints

### Data Validation
- Enforce character limits on log (10,000) and metadata fields
- Validate UUID4 format for all ID fields
- Implement runtime type checking for critical data

### Error Handling
- Graceful handling of storage quota exceeded
- Validation errors with user-friendly messages
- Atomic transaction rollback for failed operations

## Testing Strategy

### Unit Tests
- Test UUID4 generation and validation
- Validate interface constraints and type definitions
- Test helper functions for metadata management
- Mock localStorage for isolated testing

### Integration Tests
- Test atomFamily storage persistence
- Validate lazy loading behavior
- Test storage quota and cleanup mechanisms

### E2E Tests
- Create sims with metadata through UI
- Verify data persistence across page reloads
- Test large dataset performance (1000+ sims)

## Migration and Compatibility

### Data Migration
- Version schema for future migrations
- Implement backward compatibility for data formats
- Provide import/export utilities for data portability

### Browser Compatibility
- Test localStorage limits across browsers
- Implement fallbacks for storage failures
- Ensure atomFamily works in all target browsers

## Dependencies

### Required Packages
- `jotai` - Core state management and atomFamily
- `uuid` - UUID4 generation and validation
- `@types/uuid` - TypeScript definitions

### Optional Enhancements
- `lz-string` - Data compression for storage
- `zod` - Runtime schema validation
- `immer` - Immutable state updates

## Implementation Checklist

- [ ] Define UUID4 type and validation functions
- [ ] Create Sim and Metadata interfaces
- [ ] Implement atomFamily pattern with storage
- [ ] Add lazy atom accessor functions
- [ ] Create metadata CRUD helper functions
- [ ] Write comprehensive unit tests
- [ ] Implement storage monitoring and cleanup
- [ ] Add validation and error handling
- [ ] Document API and usage patterns
- [ ] Performance testing with large datasets

---

**Note:** This design prioritizes atomic state management with persistent storage while maintaining strict type safety and performance optimization through lazy loading patterns. 