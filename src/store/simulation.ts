import { atom, Getter, Setter } from 'jotai';
import type { SimulationState, SimulationSettings, Sim, LLMProvider } from '../types/simulation';

const defaultSettings: SimulationSettings = {
  speed: 1,
  allowRatedContent: false,
  allowXRatedContent: false,
  ruleSet: 'default',
  customRules: []
};

const defaultState: SimulationState = {
  sims: [],
  settings: defaultSettings,
  tick: 0,
  isRunning: false
};

// Load state from localStorage if available
const loadState = (): SimulationState => {
  try {
    const savedState = localStorage.getItem('simulationState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return defaultState;
};

export const simulationStateAtom = atom<SimulationState>(loadState());

export const settingsAtom = atom(
  (get: Getter) => get(simulationStateAtom).settings,
  (get: Getter, set: Setter, newSettings: SimulationSettings) => {
    const currentState = get(simulationStateAtom);
    const newState = {
      ...currentState,
      settings: newSettings
    };
    set(simulationStateAtom, newState);
    localStorage.setItem('simulationState', JSON.stringify(newState));
  }
);

export const simsAtom = atom(
  (get: Getter) => get(simulationStateAtom).sims,
  (get: Getter, set: Setter, newSims: Sim[]) => {
    const currentState = get(simulationStateAtom);
    const newState = {
      ...currentState,
      sims: newSims
    };
    set(simulationStateAtom, newState);
    localStorage.setItem('simulationState', JSON.stringify(newState));
  }
);

export const llmProviderAtom = atom<LLMProvider | null>(null);

// Helper atoms for derived state
export const isRunningAtom = atom(
  (get: Getter) => get(simulationStateAtom).isRunning
);

export const tickAtom = atom(
  (get: Getter) => get(simulationStateAtom).tick
);

// Actions
export const addSimAtom = atom(
  null,
  (get: Getter, set: Setter, sim: Sim) => {
    const currentSims = get(simsAtom);
    set(simsAtom, [...currentSims, sim]);
  }
);

export const removeSimAtom = atom(
  null,
  (get: Getter, set: Setter, simId: string) => {
    const currentSims = get(simsAtom);
    set(simsAtom, currentSims.filter((sim: Sim) => sim.id !== simId));
  }
);

export const updateSimContextAtom = atom(
  null,
  (get: Getter, set: Setter, { simId, message }: { simId: string; message: string }) => {
    const currentSims = get(simsAtom);
    const updatedSims = currentSims.map((sim: Sim) => {
      if (sim.id === simId) {
        return {
          ...sim,
          contextLog: [...sim.contextLog, message],
          lastUpdated: Date.now()
        };
      }
      return sim;
    });
    set(simsAtom, updatedSims);
  }
); 