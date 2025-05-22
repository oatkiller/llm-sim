import React from 'react';
import { useAtom } from 'jotai';
import * as Form from '@radix-ui/react-form';
import { llmProviderAtom } from '../store/simulation';
import type { LLMProvider } from '../types/simulation';

export const ApiKeyForm: React.FC = () => {
  const [, setLlmProvider] = useAtom(llmProviderAtom);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const apiKey = formData.get('apiKey') as string;
    const model = formData.get('model') as string;

    if (!apiKey || !model) return;

    const provider: LLMProvider = {
      name: 'openai',
      apiKey,
      model
    };

    setLlmProvider(provider);
    event.currentTarget.reset();
  };

  return (
    <Form.Root onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <Form.Field name="apiKey">
        <div className="space-y-2">
          <Form.Label className="text-sm font-medium">OpenAI API Key</Form.Label>
          <Form.Control asChild>
            <input
              type="password"
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
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a model</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </Form.Control>
          <Form.Message match="valueMissing" className="text-sm text-red-500">
            Please select a model
          </Form.Message>
        </div>
      </Form.Field>

      <Form.Submit asChild>
        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Set API Key
        </button>
      </Form.Submit>
    </Form.Root>
  );
}; 