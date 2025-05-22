import React from 'react';
import { useAtom } from 'jotai';
import { simulationStateAtom } from '../store/simulation';
import type { LogEntry } from '../types/simulation';
import { worker } from '../workers/simulation.worker';

export const SimulationControls: React.FC = () => {
  const [state, setState] = useAtom(simulationStateAtom);
  const activeSim = state.sims.find(sim => sim.id === state.activeSimId);

  const handleNextStep = () => {
    // Send message to worker to process next step
    worker.postMessage({ type: 'NEXT_STEP', payload: { simId: state.activeSimId } });
  };

  const handleSpeedChange = (speed: number) => {
    if (state.activeSimId) {
      setState(prev => ({
        ...prev,
        sims: prev.sims.map(sim => 
          sim.id === state.activeSimId 
            ? { ...sim, speed }
            : sim
        )
      }));
    }
  };

  const renderLogEntry = (entry: LogEntry) => {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const typeClass = {
      prompt: 'text-blue-600',
      response: 'text-green-600',
      system: 'text-gray-600',
      simulation: 'text-purple-600'
    }[entry.type];

    return (
      <div key={entry.timestamp} className="mb-2">
        <span className="text-gray-500 text-sm">{timestamp}</span>
        <span className={`ml-2 font-medium ${typeClass}`}>[{entry.type}]</span>
        <div className="mt-1">{entry.content}</div>
        {entry.metadata && (
          <pre className="mt-1 text-xs text-gray-500">
            {JSON.stringify(entry.metadata, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Simulation Controls</h3>
        <div className="flex gap-4 items-center">
          <button
            onClick={handleNextStep}
            className="btn bg-blue-600 text-white px-4 py-2 rounded"
          >
            Next Step
          </button>
          <div className="flex items-center gap-2">
            <label>Speed:</label>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={activeSim?.speed || 0}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="w-32"
            />
            <span>{activeSim?.speed || 0}s</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Simulation Log</h3>
        <div className="h-96 overflow-y-auto border rounded p-4 bg-gray-50">
          {activeSim?.contextLog.map(renderLogEntry)}
        </div>
      </div>

      {activeSim?.currentPrompt && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Current Prompt</h3>
          <div className="p-4 bg-gray-50 rounded border">
            <pre className="whitespace-pre-wrap">{activeSim.currentPrompt}</pre>
          </div>
        </div>
      )}
    </div>
  );
}; 