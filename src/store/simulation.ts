import { atom } from 'jotai';
import type { SimulationState, LLMProvider } from '../types/simulation';

export const simulationStateAtom = atom<SimulationState>({
  sims: [],
  activeSimId: undefined,
  nextStepTimer: undefined
});

export const llmProviderAtom = atom<LLMProvider | null>(null); 