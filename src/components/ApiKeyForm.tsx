import React, { useState } from 'react';
import { useAtom } from 'jotai';
import * as Form from '@radix-ui/react-form';
import { llmProviderAtom } from '../store/simulation';
import type { LLMProvider, LogEntry } from '../types/simulation';
import { LLMService } from '../lib/llm';

export const ApiKeyForm: React.FC = () => {
  const [llmProvider, setLlmProvider] = useAtom(llmProviderAtom);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    apiKey: '',
    model: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const testApiKey = async (provider: LLMProvider) => {
    setStatus('testing');
    setError('');

    try {
      const llm = new LLMService(provider);
      const response = await llm.testConnection();

      // Log the test request and response
      const logEntry: LogEntry = {
        timestamp: Date.now(),
        type: 'system',
        content: 'Testing API connection',
        metadata: {
          model: provider.model,
          duration: response.duration,
          tokens: response.tokens
        }
      };

      setStatus('success');
      setLlmProvider(provider);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to connect to API');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { apiKey, model } = formData;

    if (!apiKey || !model) return;

    const provider: LLMProvider = {
      type: 'openai',
      apiKey,
      model
    };

    await testApiKey(provider);
  };

  return (
    <Form.Root onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <Form.Field name="apiKey">
        <div className="space-y-2">
          <Form.Label className="text-sm font-medium">OpenAI API Key</Form.Label>
          <Form.Control asChild>
            <input
              type="password"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your OpenAI API key"
            />
          </Form.Control>
          <Form.Message match="valueMissing" className="text-sm text-red-500">
            Please enter your API key
          </Form.Message>
        </div>
      </Form.Field>

      <Form.Field name="model">
        <div className="space-y-2">
          <Form.Label className="text-sm font-medium">Model</Form.Label>
          <Form.Control asChild>
            <select
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a model</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </Form.Control>
          <Form.Message match="valueMissing" className="text-sm text-red-500">
            Please select a model
          </Form.Message>
        </div>
      </Form.Field>

      {status === 'error' && (
        <div className="p-2 text-sm text-red-500 bg-red-50 rounded">
          {error}
        </div>
      )}

      {status === 'success' && (
        <div className="p-2 text-sm text-green-500 bg-green-50 rounded flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          API key validated successfully
        </div>
      )}

      <Form.Submit asChild>
        <button
          type="submit"
          disabled={status === 'testing'}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'testing' ? 'Testing...' : 'Set API Key'}
        </button>
      </Form.Submit>
    </Form.Root>
  );
}; 