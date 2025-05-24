# Data Persistence Architecture Analysis

## Critical Issue Summary

**Data persistence is broken** because React components are not connected to Jotai atoms. Data is stored correctly in localStorage via Jotai `atomWithStorage`, but React components use local state instead of reading from these atoms.

## Current Broken Architecture

### The Problem

1. **Data Access Layer**: Correctly implements Jotai `atomWithStorage` and stores data in localStorage
2. **React Components**: Use `useState` instead of `useAtom`, completely bypassing the persistence layer
3. **Result**: Data is written to localStorage but never read back by React components

### Current Flow (BROKEN)

```
User Action (Create Sim)
    ↓
App.tsx handleCreateSim()
    ↓
calls createSim() → Data Access Layer
    ↓
Data Access Layer → Jotai atoms → atomWithStorage → localStorage ✅
    ↓
App.tsx updates local React state with setSims() ❌
    ↓
Page reload → React state is lost ❌
    ↓
localStorage data exists but React doesn't read it ❌
```

### Architectural Components

#### 1. Jotai Atoms Layer (WORKING CORRECTLY)
**File**: `src/types/atoms.ts`

```typescript
// These work correctly and persist to localStorage
export const simAtomFamily = atomFamily((entityId: UUID4) =>
  atomWithStorage<Sim | null>(`sim-${entityId}`, null, storage, {
    getOnInit: true, // ✅ Automatically loads from storage
  })
);

export const metadataAtomFamily = atomFamily((entityId: UUID4) =>
  atomWithStorage<Metadata[]>(`metadata-${entityId}`, [], storage, {
    getOnInit: true, // ✅ Automatically loads from storage
  })
);

export const simIdsAtom = atomWithStorage<UUID4[]>('sim-ids', [], storage, {
  getOnInit: true, // ✅ Automatically loads from storage
});
```

#### 2. Data Access Layer (WORKING CORRECTLY)
**File**: `src/types/data-access-layer.ts`

```typescript
// This correctly uses Jotai atoms and persists data
export async function createSim(input: CreateSimInput): Promise<DataResult<Sim>> {
  // ... validation ...
  
  // ✅ Store in atoms (which persist to localStorage)
  const simAtom = getSimAtom(newSim.id);
  dataStore.set(simAtom, newSim);
  
  // ✅ Update sim IDs list (which persists to localStorage)
  const currentIds = dataStore.get(simIdsAtom);
  dataStore.set(simIdsAtom, [...currentIds, newSim.id]);
  
  return { success: true, data: newSim };
}
```

#### 3. React Components (BROKEN - NOT USING ATOMS)
**File**: `src/App.tsx`

```typescript
const App: React.FC = () => {
  // ❌ Using React state instead of Jotai atoms
  const [sims, setSims] = useState<SimWithMetadata[]>([]);
  
  const handleCreateSim = async () => {
    // ✅ This correctly stores data via atoms
    const result = await createSim({ log: newSimLog.trim() });
    
    if (result.success && result.data) {
      // ❌ This only updates React state, not connected to atoms
      setSims(prev => [...prev, simWithMetadata]);
    }
  };
  
  // ❌ Never loads existing data from atoms on mount
  // ❌ No useAtom hooks connecting to persisted data
  
  return (
    // Renders sims from React state, which is empty on reload
  );
};
```

### Storage State vs React State

| Storage Location | Data Status | React Visibility |
|------------------|-------------|------------------|
| localStorage `sim-ids` | ✅ Contains sim IDs | ❌ React doesn't read |
| localStorage `sim-{id}` | ✅ Contains sim data | ❌ React doesn't read |
| localStorage `metadata-{id}` | ✅ Contains metadata | ❌ React doesn't read |
| React useState `sims` | ❌ Empty on reload | ✅ React uses this |

## The Solution

### Required Changes

1. **Replace React State with Jotai Atoms in Components**
   - Remove `useState` for sims data
   - Use `useAtom` to connect to `simIdsAtom`
   - Use derived atoms for computed data

2. **Load Existing Data on Mount**
   - Use atoms that automatically load from localStorage
   - Display existing sims immediately when app loads

3. **Ensure Bidirectional Data Flow**
   - Writes go through data access layer → atoms → localStorage
   - Reads come from atoms → React components

### Corrected Architecture Flow

```
App Load
    ↓
useAtom(simIdsAtom) → reads from localStorage ✅
    ↓
Renders existing sims ✅
    ↓
User Action (Create Sim)
    ↓
createSim() → Data Access Layer → atoms → localStorage ✅
    ↓
Atom updates trigger React re-render ✅
    ↓
UI updates automatically ✅
```

## Implementation Plan

### Phase 1: Fix App.tsx
- Replace `useState` with `useAtom`
- Load existing sims using atoms
- Remove manual state management

### Phase 2: Create Derived Atoms
- Create atoms for computed values (metadata counts, etc.)
- Ensure reactive updates throughout the UI

### Phase 3: Update Other Components
- Apply same pattern to any other components
- Ensure consistent use of atoms everywhere

### Phase 4: Testing
- Verify persistence across reloads
- Test create/read/update/delete operations
- Validate localStorage sync

## File Changes Required

1. **`src/App.tsx`** - Replace React state with Jotai atoms
2. **`src/types/atoms.ts`** - Add derived atoms for UI computations
3. **Add Provider** - Ensure Jotai Provider wraps the app (if not already)

## Testing Strategy

1. Create a sim → reload page → verify sim appears
2. Create metadata → reload page → verify metadata appears  
3. Multiple sims → reload page → verify all sims appear
4. Check localStorage manually in DevTools
5. Verify atoms are reading/writing correctly

This fix will restore the intended architecture where Jotai atoms serve as the single source of truth for all persistent state. 