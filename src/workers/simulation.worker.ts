import type { SimulationState, System } from '../types/simulation';
import { allSystems } from '../systems/core';

let simulationState: SimulationState | null = null;
let isRunning = false;
let lastTickTime = 0;

const TICK_INTERVAL = 1000; // 1 second per tick

function updateSimulation() {
  if (!simulationState || !isRunning) return;

  const currentTime = Date.now();
  const elapsed = currentTime - lastTickTime;
  
  if (elapsed >= TICK_INTERVAL / simulationState.settings.speed) {
    lastTickTime = currentTime;
    
    // Run all systems
    let newState = { ...simulationState };
    for (const system of allSystems) {
      newState = system.update(newState);
    }
    
    simulationState = {
      ...newState,
      tick: newState.tick + 1
    };

    // Send updated state back to main thread
    self.postMessage({
      type: 'STATE_UPDATE',
      state: simulationState
    });
  }

  // Schedule next update
  requestAnimationFrame(updateSimulation);
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT':
      simulationState = payload.state;
      isRunning = true;
      lastTickTime = Date.now();
      requestAnimationFrame(updateSimulation);
      break;

    case 'PAUSE':
      isRunning = false;
      break;

    case 'RESUME':
      isRunning = true;
      lastTickTime = Date.now();
      requestAnimationFrame(updateSimulation);
      break;

    case 'UPDATE_SETTINGS':
      if (simulationState) {
        simulationState = {
          ...simulationState,
          settings: payload.settings
        };
      }
      break;

    case 'ADD_SIM':
      if (simulationState) {
        simulationState = {
          ...simulationState,
          sims: [...simulationState.sims, payload.sim]
        };
      }
      break;

    case 'REMOVE_SIM':
      if (simulationState) {
        simulationState = {
          ...simulationState,
          sims: simulationState.sims.filter(sim => sim.id !== payload.simId)
        };
      }
      break;
  }
}; 