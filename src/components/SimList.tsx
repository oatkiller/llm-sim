import React from 'react';
import { useAtom } from 'jotai';
import { simsAtom, removeSimAtom } from '../store/simulation';
import type { Sim } from '../types/simulation';

export const SimList: React.FC = () => {
  const [sims] = useAtom(simsAtom);
  const [, removeSim] = useAtom(removeSimAtom);

  return (
    <div className="space-y-4">
      {sims.map((sim) => (
        <div key={sim.id} className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{sim.name}</h3>
            <button
              onClick={() => removeSim(sim.id)}
              className="px-3 py-1 text-sm text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Remove
            </button>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Traits</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-500">Hunger</span>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${sim.traits.hunger}%` }}
                  />
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Loneliness</span>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${sim.traits.loneliness}%` }}
                  />
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Sex Drive</span>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${sim.traits.sexDrive}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Context Log</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {sim.contextLog.map((message, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {message}
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 