import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { createSim, createMetadata } from './types/data-access-layer';
import { simsWithMetadataAtom } from './types/atoms';

interface MetadataField {
  key: string;
  value: string;
}

const App: React.FC = () => {
  // Use Jotai atom for sims data - this automatically loads from localStorage
  const [sims] = useAtom(simsWithMetadataAtom);
  
  const [newSimLog, setNewSimLog] = useState('');
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([{ key: '', value: '' }]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMetadataField = () => {
    setMetadataFields(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveMetadataField = (index: number) => {
    setMetadataFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleMetadataFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    setMetadataFields(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleCreateSim = async () => {
    if (!newSimLog.trim()) {
      setError('Log content is required');
      return;
    }

    // Filter out empty metadata fields (HTML maxLength prevents length violations)
    const validMetadataFields = metadataFields.filter(field => 
      field.key.trim() && field.value.trim()
    );

    setIsCreating(true);
    setError(null);

    try {
      // Create the sim first
      const result = await createSim({ log: newSimLog.trim() });
      
      if (result.success && result.data) {
        const newSim = result.data;
        
        // Create metadata for the sim
        for (const field of validMetadataFields) {
          await createMetadata({
            entity_id: newSim.id,
            key: field.key.trim(),
            value: field.value.trim()
          });
        }
        
        // No need to manually update sims state - the atom will automatically update
        // and trigger a re-render when the data changes in localStorage
        
        setNewSimLog('');
        setMetadataFields([{ key: '', value: '' }]);
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

            {/* Metadata Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metadata (Optional)
              </label>
              <div className="space-y-3">
                {metadataFields.map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Key"
                        value={field.key}
                        onChange={(e) => handleMetadataFieldChange(index, 'key', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        maxLength={100}
                        disabled={isCreating}
                        data-testid={`metadata-key-${index}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {field.key.length}/100
                      </div>
                    </div>
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) => handleMetadataFieldChange(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        maxLength={10000}
                        disabled={isCreating}
                        data-testid={`metadata-value-${index}`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {field.value.length}/10,000
                      </div>
                    </div>
                    <div className="col-span-2">
                      {metadataFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMetadataField(index)}
                          className="px-2 py-2 text-red-600 hover:text-red-800 text-sm"
                          disabled={isCreating}
                          data-testid={`remove-metadata-${index}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddMetadataField}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                  disabled={isCreating}
                  data-testid="add-metadata-field"
                >
                  Add Metadata Field
                </button>
              </div>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm" data-testid="error-message">
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
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-500">
                      Created: {new Date(sim.createdAt).toLocaleString()}
                    </div>
                    {sim.metadataCount > 0 && (
                      <div className="text-sm text-blue-600 font-medium" data-testid="metadata-count">
                        {sim.metadataCount} metadata field{sim.metadataCount !== 1 ? 's' : ''}
                      </div>
                    )}
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
