import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { simulationStateAtom } from '../store/simulation';
import type { Simulation, LogEntry } from '../types/simulation';

export const SimList: React.FC = () => {
  const [state, setState] = useAtom(simulationStateAtom);
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [newLogEntry, setNewLogEntry] = useState('');
  const [editingContent, setEditingContent] = useState('');

  const handleRemove = (id: string) => {
    setState(prev => ({
      ...prev,
      sims: prev.sims.filter(sim => sim.id !== id),
      activeSimId: prev.activeSimId === id ? prev.sims[0]?.id : undefined
    }));
  };

  const handleSelect = (id: string) => {
    setState(prev => ({
      ...prev,
      activeSimId: id
    }));
  };

  const handleAddLogEntry = (simId: string) => {
    if (!newLogEntry.trim()) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      type: 'system',
      content: newLogEntry.trim()
    };

    setState(prev => ({
      ...prev,
      sims: prev.sims.map(sim => 
        sim.id === simId 
          ? { ...sim, contextLog: [...sim.contextLog, entry] }
          : sim
      )
    }));

    setNewLogEntry('');
  };

  const handleRemoveLogEntry = (simId: string, timestamp: number) => {
    setState(prev => ({
      ...prev,
      sims: prev.sims.map(sim => 
        sim.id === simId 
          ? { ...sim, contextLog: sim.contextLog.filter(entry => entry.timestamp !== timestamp) }
          : sim
      )
    }));
  };

  const handleStartEdit = (simId: string, entry: LogEntry) => {
    setEditingLog(`${simId}-${entry.timestamp}`);
    setEditingContent(entry.content);
  };

  const handleSaveEdit = (simId: string, timestamp: number) => {
    setState(prev => ({
      ...prev,
      sims: prev.sims.map(sim => 
        sim.id === simId 
          ? { 
              ...sim, 
              contextLog: sim.contextLog.map(entry => 
                entry.timestamp === timestamp 
                  ? { ...entry, content: editingContent }
                  : entry
              )
            }
          : sim
      )
    }));
    setEditingLog(null);
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
    setEditingContent('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Simulations</h3>
      <div className="space-y-4">
        {state.sims.map((sim) => (
          <details
            key={sim.id}
            className={`group rounded-md ${
              state.activeSimId === sim.id ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <summary className="flex items-center justify-between p-2 cursor-pointer">
              <button
                onClick={() => handleSelect(sim.id)}
                className="flex-1 text-left px-2 py-1"
              >
                {sim.name}
              </button>
              <button
                onClick={() => handleRemove(sim.id)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                ×
              </button>
            </summary>
            <div className="p-4 border-t">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Context Log</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sim.contextLog.map((entry) => (
                    <div key={entry.timestamp} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      {editingLog === `${sim.id}-${entry.timestamp}` ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(sim.id, entry.timestamp)}
                            className="text-green-500 hover:text-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <span 
                            className="flex-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                            onClick={() => handleStartEdit(sim.id, entry)}
                          >
                            {entry.content}
                          </span>
                          <button
                            onClick={() => handleRemoveLogEntry(sim.id, entry.timestamp)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLogEntry}
                  onChange={(e) => setNewLogEntry(e.target.value)}
                  placeholder="Add new context entry..."
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddLogEntry(sim.id);
                    }
                  }}
                />
                <button
                  onClick={() => handleAddLogEntry(sim.id)}
                  className="px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}; 