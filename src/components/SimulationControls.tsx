import React, { useRef } from 'react';
import { useAtom } from 'jotai';
import { simulationStateAtom } from '../store/simulation';
import type { LogEntry } from '../types/simulation';
import { worker } from '../workers/simulation.worker';
import { ECSSystem } from '../lib/ecs';

export const SimulationControls: React.FC = () => {
  const [state, setState] = useAtom(simulationStateAtom);
  const ecsRef = useRef<ECSSystem>(new ECSSystem());

  const handleStart = () => {
    if (!state.activeSimId) return;

    setState(prev => ({
      ...prev,
      sims: prev.sims.map(sim =>
        sim.id === state.activeSimId
          ? { ...sim, status: 'running' }
          : sim
      )
    }));

    // Run ECS tick
    const newState = ecsRef.current.tick(state);
    setState(newState);
  };

  const handlePause = () => {
    if (!state.activeSimId) return;

    setState(prev => ({
      ...prev,
      sims: prev.sims.map(sim =>
        sim.id === state.activeSimId
          ? { ...sim, status: 'paused' }
          : sim
      )
    }));
  };

  const handleStep = () => {
    if (!state.activeSimId) return;

    // Run ECS tick
    const newState = ecsRef.current.tick(state);
    setState(newState);
  };

  const activeSim = state.sims.find(sim => sim.id === state.activeSimId);

  const handleNextStep = () => {
    if (!state.activeSimId) return;
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

  if (!activeSim) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">No Active Simulation</h3>
        <p className="text-gray-500">Select a simulation to begin.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Simulation Controls</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleStart}
          disabled={!activeSim || activeSim.status === 'running'}
          className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start
        </button>
        
        <button
          onClick={handlePause}
          disabled={!activeSim || activeSim.status !== 'running'}
          className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pause
        </button>
        
        <button
          onClick={handleStep}
          disabled={!activeSim || activeSim.status === 'running'}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Step
        </button>
      </div>

      {activeSim && (
        <div className="text-sm text-gray-600">
          <p>Status: <span className="font-medium">{activeSim.status}</span></p>
          <p>Speed: <span className="font-medium">{activeSim.speed}s</span></p>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Simulation Log</h3>
        <div className="h-96 overflow-y-auto border rounded p-4 bg-gray-50">
          {activeSim.contextLog.map(renderLogEntry)}
        </div>
      </div>

      {activeSim.currentPrompt && (
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