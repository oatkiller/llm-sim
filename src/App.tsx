import React, { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { SettingsForm } from './components/SettingsForm';
import { CreateSimForm } from './components/CreateSimForm';
import { SimList } from './components/SimList';
import { ApiKeyForm } from './components/ApiKeyForm';
import { DebugPanel } from './components/DebugPanel';
import { Help } from './components/Help';
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ApiKeyForm />
            <SettingsForm />
            <CreateSimForm />
          </div>
          <div>
            <SimList />
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Help & Documentation</h2>
          <Help />
        </div>
        <DebugPanel />
      </div>
    </div>
  );
};
