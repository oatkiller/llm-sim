import React from 'react';
import { useAtom } from 'jotai';
import { simulationStateAtom } from '../store/simulation';
import type { SimulationSettings } from '../types/simulation';

const defaultSettings: SimulationSettings = {
  speed: 1,
  allowRatedContent: false,
  allowXRatedContent: false,
  ruleSet: 'default',
  customRules: []
};

export const SettingsForm: React.FC = () => {
  const [state, setState] = useAtom(simulationStateAtom);

  const handleSettingsChange = (newSettings: Partial<SimulationSettings>) => {
    // Since we removed the settings from the state, we'll just log the changes for now
    console.log('Settings changed:', newSettings);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Simulation Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Speed</label>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={defaultSettings.speed}
            onChange={(e) => handleSettingsChange({ speed: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={defaultSettings.allowRatedContent}
              onChange={(e) => handleSettingsChange({ allowRatedContent: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Allow Rated Content</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={defaultSettings.allowXRatedContent}
              onChange={(e) => handleSettingsChange({ allowXRatedContent: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Allow X-Rated Content</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rule Set</label>
          <select
            value={defaultSettings.ruleSet}
            onChange={(e) => handleSettingsChange({ ruleSet: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="strict">Strict</option>
            <option value="creative">Creative</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 