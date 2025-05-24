import React, { useState } from 'react';
import { createSim } from './types/data-access-layer';
import type { UUID4 } from './types/uuid';

interface Sim {
  id: UUID4;
  log: string;
  createdAt: number;
  updatedAt: number;
}

const App: React.FC = () => {
  const [sims, setSims] = useState<Sim[]>([]);
  const [newSimLog, setNewSimLog] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSim = async () => {
    if (!newSimLog.trim()) {
      setError('Log content is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await createSim({ log: newSimLog.trim() });
      
      if (result.success && result.data) {
        setSims(prev => [...prev, result.data!]);
        setNewSimLog('');
      } else {
        setError(result.error || 'Failed to create sim');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Sim System
        </h1>
        
        {/* Create New Sim Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Create New Sim
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="sim-log" className="block text-sm font-medium text-gray-700 mb-2">
                Log Content
              </label>
              <textarea
                id="sim-log"
                value={newSimLog}
                onChange={(e) => setNewSimLog(e.target.value)}
                placeholder="Enter your sim's log content here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                maxLength={10000}
                disabled={isCreating}
              />
              <div className="text-sm text-gray-500 mt-1">
                {newSimLog.length}/10,000 characters
              </div>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <button
              onClick={handleCreateSim}
              disabled={isCreating || !newSimLog.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Sim'}
            </button>
          </div>
        </div>
        
        {/* Sim List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Sims ({sims.length})
          </h2>
          
          {sims.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No sims created yet. Create your first sim above!
            </p>
          ) : (
            <div className="space-y-4">
              {sims.map((sim) => (
                <div key={sim.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Created: {new Date(sim.createdAt).toLocaleString()}
                  </div>
                  <div className="text-gray-800">
                    {sim.log.length > 200 ? `${sim.log.substring(0, 200)}...` : sim.log}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
