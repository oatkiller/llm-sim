import type { Simulation, SimulationState } from '../types/simulation';
import { parseCharacterResponse } from '../lib/character';

export const worker = new Worker(new URL('./simulation.worker.ts', import.meta.url), {
  type: 'module'
});

let state: SimulationState = {
  sims: [],
  activeSimId: undefined,
  nextStepTimer: undefined
};

const processNextStep = async (simId: string) => {
  const sim = state.sims.find(s => s.id === simId);
  if (!sim) return;

  // Add current prompt to log
  if (sim.currentPrompt) {
    sim.contextLog.push({
      timestamp: Date.now(),
      type: 'prompt',
      content: sim.currentPrompt
    });
  }

  // Process the step (in a real app, this would call the LLM)
  const response = "Character response would go here";
  sim.contextLog.push({
    timestamp: Date.now(),
    type: 'response',
    content: response
  });

  // Update state
  state = {
    ...state,
    sims: state.sims.map(s => 
      s.id === simId ? { ...s, contextLog: [...s.contextLog] } : s
    )
  };

  // Notify main thread
  self.postMessage({
    type: 'STATE_UPDATE',
    payload: { state }
  });

  // Schedule next step if speed > 0
  if (sim.speed > 0) {
    const timerId = setTimeout(() => {
      processNextStep(simId);
    }, sim.speed * 1000);
    state.nextStepTimer = timerId as unknown as number;
  }
};

self.onmessage = (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      state = payload.state;
      break;

    case 'NEXT_STEP':
      if (payload.simId) {
        processNextStep(payload.simId);
      }
      break;

    case 'PAUSE':
      if (state.nextStepTimer) {
        clearTimeout(state.nextStepTimer as unknown as NodeJS.Timeout);
        state.nextStepTimer = undefined;
      }
      break;

    case 'RESUME':
      if (state.activeSimId) {
        processNextStep(state.activeSimId);
      }
      break;
  }
}; 