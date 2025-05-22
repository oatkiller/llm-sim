import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { simulationStateAtom } from '../store/simulation';
import type { Simulation } from '../types/simulation';

export const CreateSimForm: React.FC = () => {
  const [state, setState] = useAtom(simulationStateAtom);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSim: Simulation = {
      id: crypto.randomUUID(),
      name: name.trim(),
      status: 'idle',
      contextLog: [],
      speed: 1,
      currentPrompt: '',
      character: {
        name: name.trim(),
        traits: [],
        background: ''
      }
    };

    setState(prev => ({
      ...prev,
      sims: [...prev.sims, newSim],
      activeSimId: newSim.id
    }));

    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Create New Simulation</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="simName" className="block text-sm font-medium text-gray-700">
            Simulation Name
          </label>
          <input
            type="text"
            id="simName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter simulation name"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Simulation
        </button>
      </div>
    </form>
  );
}; 