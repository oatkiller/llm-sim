import React, { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { SettingsForm } from './components/SettingsForm';
import { CreateSimForm } from './components/CreateSimForm';
import { SimList } from './components/SimList';
import { ApiKeyForm } from './components/ApiKeyForm';
import { Help } from './components/Help';
import { SimulationControls } from './components/SimulationControls';
import { simulationStateAtom, llmProviderAtom } from './store/simulation';
import { LLMService } from './lib/llm';
import { CHARACTER_TEMPLATES } from './lib/character';
import type { SimulationState } from './types/simulation';

const worker = new Worker(new URL('./workers/simulation.worker.ts', import.meta.url), {
  type: 'module'
});

const DEFAULT_SIMS = [
  {
    id: '1',
    name: 'The Detective',
    status: 'idle' as const,
    contextLog: [],
    speed: 0,
    currentPrompt: CHARACTER_TEMPLATES.detective.prompt,
    character: CHARACTER_TEMPLATES.detective
  },
  {
    id: '2',
    name: 'The Scientist',
    status: 'idle' as const,
    contextLog: [],
    speed: 0,
    currentPrompt: CHARACTER_TEMPLATES.scientist.prompt,
    character: CHARACTER_TEMPLATES.scientist
  }
];

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
    // Initialize with default simulations
    setState(prev => ({
      ...prev,
      sims: DEFAULT_SIMS,
      activeSimId: DEFAULT_SIMS[0].id
    }));

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
          <SimulationControls />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Help & Documentation</h2>
          <Help />
        </div>
      </div>
    </div>
  );
};
