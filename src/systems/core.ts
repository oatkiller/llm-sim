import type { System, SimulationState, Sim } from '../types/simulation';

const HUNGER_RATE = 0.1;
const LONELINESS_RATE = 0.05;
const SEX_DRIVE_RATE = 0.08;

export const hungerSystem: System = {
  name: 'hunger',
  update: (state: SimulationState): SimulationState => {
    const updatedSims = state.sims.map(sim => {
      const currentHunger = sim.traits.hunger || 0;
      const newHunger = Math.min(100, currentHunger + HUNGER_RATE);
      
      if (newHunger > 80) {
        sim.contextLog.push('You are feeling extremely hungry.');
      } else if (newHunger > 60) {
        sim.contextLog.push('You are feeling quite hungry.');
      }
      
      return {
        ...sim,
        traits: {
          ...sim.traits,
          hunger: newHunger
        }
      };
    });

    return {
      ...state,
      sims: updatedSims
    };
  }
};

export const lonelinessSystem: System = {
  name: 'loneliness',
  update: (state: SimulationState): SimulationState => {
    const updatedSims = state.sims.map(sim => {
      const currentLoneliness = sim.traits.loneliness || 0;
      const newLoneliness = Math.min(100, currentLoneliness + LONELINESS_RATE);
      
      if (newLoneliness > 80) {
        sim.contextLog.push('You are feeling extremely lonely.');
      } else if (newLoneliness > 60) {
        sim.contextLog.push('You are feeling quite lonely.');
      }
      
      return {
        ...sim,
        traits: {
          ...sim.traits,
          loneliness: newLoneliness
        }
      };
    });

    return {
      ...state,
      sims: updatedSims
    };
  }
};

export const sexDriveSystem: System = {
  name: 'sexDrive',
  update: (state: SimulationState): SimulationState => {
    const updatedSims = state.sims.map(sim => {
      const currentSexDrive = sim.traits.sexDrive || 0;
      const newSexDrive = Math.min(100, currentSexDrive + SEX_DRIVE_RATE);
      
      if (newSexDrive > 80 && state.settings.allowXRatedContent) {
        sim.contextLog.push('You are feeling extremely aroused.');
      } else if (newSexDrive > 60 && state.settings.allowRatedContent) {
        sim.contextLog.push('You are feeling quite aroused.');
      }
      
      return {
        ...sim,
        traits: {
          ...sim.traits,
          sexDrive: newSexDrive
        }
      };
    });

    return {
      ...state,
      sims: updatedSims
    };
  }
};

export const allSystems: System[] = [
  hungerSystem,
  lonelinessSystem,
  sexDriveSystem
]; 