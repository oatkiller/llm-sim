import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { SimulationState, LLMProvider } from '../types/simulation';

export const simulationStateAtom = atom<SimulationState>({
  sims: [],
  activeSimId: undefined,
  nextStepTimer: undefined
});

export const llmProviderAtom = atomWithStorage<LLMProvider | null>('llmProvider', null);
export const apiTestSuccessAtom = atomWithStorage<boolean>('apiTestSuccess', false); 