import React, { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { SettingsForm } from './components/SettingsForm';
import { CreateSimForm } from './components/CreateSimForm';
import { SimList } from './components/SimList';
import { ApiKeyForm } from './components/ApiKeyForm';
import { simulationStateAtom, llmProviderAtom } from './store/simulation';
import { LLMService } from './lib/llm';
import type { SimulationState } from './types/simulation';

const worker = new Worker(new URL('./workers/simulation.worker.ts', import.meta.url), {
  type: 'module'
});

export const App: React.FC = () => {
  const [state, setState] = useAtom(simulationStateAtom);
  const [llmProvider] = useAtom(llmProviderAtom);
  const llmServiceRef = useRef<LLMService | null>(null);

  useEffect(() => {
    if (llmProvider) {
      llmServiceRef.current = new LLMService(llmProvider);
    }
  }, [llmProvider]);

  useEffect(() => {
    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'STATE_UPDATE') {
        setState(payload.state);
      }
    };

    return () => {
      worker.terminate();
    };
  }, [setState]);

  const handleStart = () => {
    worker.postMessage({
      type: 'INIT',
      payload: { state }
    });
  };

  const handlePause = () => {
    worker.postMessage({ type: 'PAUSE' });
  };

  const handleResume = () => {
    worker.postMessage({ type: 'RESUME' });
  };

  const handleExportState = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation-state.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportLog = () => {
    const log = state.sims.map(sim => ({
      name: sim.name,
      contextLog: sim.contextLog
    }));
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation-log.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">LLM Simulation</h1>
          <p className="mt-2 text-gray-600">Create and manage AI-powered simulations</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">API Settings</h2>
              <ApiKeyForm />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Simulation Settings</h2>
              <SettingsForm />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Create New Sim</h2>
              <CreateSimForm />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Controls</h2>
              <div className="flex space-x-4">
                {!state.isRunning ? (
                  <button
                    onClick={handleStart}
                    disabled={!llmProvider}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Simulation
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handlePause}
                      className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    >
                      Pause
                    </button>
                    <button
                      onClick={handleResume}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Resume
                    </button>
                  </>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleExportState}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Export State
                </button>
                <button
                  onClick={handleExportLog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Export Log
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Sims</h2>
            <SimList />
          </div>
        </div>
      </div>
    </div>
  );
};
