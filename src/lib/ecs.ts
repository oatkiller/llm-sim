import type { Simulation, SimulationState } from '../types/simulation';

export interface SimulationRequest {
  id: string;
  simId: string;
  type: 'action' | 'interaction' | 'observation';
  content: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface System {
  name: string;
  update: (state: SimulationState) => SimulationState;
}

export class ECSSystem {
  private systems: System[] = [];
  private requests: SimulationRequest[] = [];

  constructor() {
    this.systems = [
      {
        name: 'character',
        update: (state: SimulationState) => {
          // Update character states based on their traits and context
          return {
            ...state,
            sims: state.sims.map(sim => {
              const traits = sim.character.traits;
              const context = sim.contextLog;
              
              // Generate a request based on character traits and context
              const request: SimulationRequest = {
                id: crypto.randomUUID(),
                simId: sim.id,
                type: 'action',
                content: `Character ${sim.name} is considering their next action based on traits: ${traits.join(', ')}`,
                timestamp: Date.now(),
                status: 'pending'
              };

              this.requests.push(request);
              
              return sim;
            })
          };
        }
      },
      {
        name: 'interaction',
        update: (state: SimulationState) => {
          // Generate interaction requests between characters
          const activeSims = state.sims.filter(sim => sim.status === 'running');
          
          if (activeSims.length >= 2) {
            const sim1 = activeSims[0];
            const sim2 = activeSims[1];
            
            const request: SimulationRequest = {
              id: crypto.randomUUID(),
              simId: sim1.id,
              type: 'interaction',
              content: `${sim1.name} is considering interacting with ${sim2.name}`,
              timestamp: Date.now(),
              status: 'pending'
            };

            this.requests.push(request);
          }
          
          return state;
        }
      },
      {
        name: 'observation',
        update: (state: SimulationState) => {
          // Generate observation requests for characters
          return {
            ...state,
            sims: state.sims.map(sim => {
              if (sim.status === 'running') {
                const request: SimulationRequest = {
                  id: crypto.randomUUID(),
                  simId: sim.id,
                  type: 'observation',
                  content: `${sim.name} is observing their surroundings`,
                  timestamp: Date.now(),
                  status: 'pending'
                };

                this.requests.push(request);
              }
              return sim;
            })
          };
        }
      }
    ];
  }

  tick(state: SimulationState): SimulationState {
    let newState = { ...state };
    
    // Run all systems
    for (const system of this.systems) {
      newState = system.update(newState);
    }
    
    return newState;
  }

  getPendingRequests(): SimulationRequest[] {
    return this.requests.filter(req => req.status === 'pending');
  }

  approveRequest(requestId: string): void {
    const request = this.requests.find(req => req.id === requestId);
    if (request) {
      request.status = 'approved';
    }
  }

  rejectRequest(requestId: string): void {
    const request = this.requests.find(req => req.id === requestId);
    if (request) {
      request.status = 'rejected';
    }
  }

  clearProcessedRequests(): void {
    this.requests = this.requests.filter(req => req.status === 'pending');
  }
} 