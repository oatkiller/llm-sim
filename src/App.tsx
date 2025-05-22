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
import { SimulationRequests } from './components/SimulationRequests';
import { ECSSystem, type SimulationRequest } from './lib/ecs';

const worker = new Worker(new URL('./workers/simulation.worker.ts', import.meta.url), {
  type: 'module'
});

const DEFAULT_SIMS = [
  {
    id: 'detective',
    name: 'The Detective',
    status: 'idle' as const,
    contextLog: [],
    speed: 0,
    currentPrompt: '',
    character: CHARACTER_TEMPLATES.detective
  },
  {
    id: 'scientist',
    name: 'The Scientist',
    status: 'idle' as const,
    contextLog: [],
    speed: 0,
    currentPrompt: '',
    character: CHARACTER_TEMPLATES.scientist
  }
];

export const App: React.FC = () => {
  const [state, setState] = useAtom(simulationStateAtom);
  const [llmProvider] = useAtom(llmProviderAtom);
  const llmServiceRef = useRef<LLMService | null>(null);
  const ecsRef = useRef<ECSSystem>(new ECSSystem());
  const [pendingRequests, setPendingRequests] = React.useState<SimulationRequest[]>([]);

  useEffect(() => {
    if (llmProvider) {
      llmServiceRef.current = new LLMService(llmProvider);
    }
  }, [llmProvider]);

  useEffect(() => {
    // Initialize with default simulations
    setState((prev: SimulationState) => ({
      ...prev,
      sims: DEFAULT_SIMS,
      activeSimId: DEFAULT_SIMS[0].id
    }));

    // Run first tick
    const newState = ecsRef.current.tick({
      sims: DEFAULT_SIMS,
      activeSimId: DEFAULT_SIMS[0].id
    });
    setState(newState);
    setPendingRequests(ecsRef.current.getPendingRequests());

    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'STATE_UPDATE') {
        setState(payload.state);
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  const handleApproveRequest = (requestId: string) => {
    ecsRef.current.approveRequest(requestId);
    setPendingRequests(ecsRef.current.getPendingRequests());
  };

  const handleRejectRequest = (requestId: string) => {
    ecsRef.current.rejectRequest(requestId);
    setPendingRequests(ecsRef.current.getPendingRequests());
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
          <SimulationControls />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Help & Documentation</h2>
          <Help />
        </div>

        {llmProvider ? (
          <>
            <SimulationRequests
              requests={pendingRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">
              Please set your API key and select a model to start simulating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
