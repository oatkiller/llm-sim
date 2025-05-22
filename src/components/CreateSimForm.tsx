import React from 'react';
import { useAtom } from 'jotai';
import * as Form from '@radix-ui/react-form';
import { addSimAtom } from '../store/simulation';
import type { Sim } from '../types/simulation';

export const CreateSimForm: React.FC = () => {
  const [, addSim] = useAtom(addSimAtom);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;

    if (!name) return;

    const newSim: Sim = {
      id: crypto.randomUUID(),
      name,
      contextLog: [`You are ${name}. You have just been created.`],
      traits: {
        hunger: 0,
        loneliness: 0,
        sexDrive: 0
      },
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };

    addSim(newSim);
    event.currentTarget.reset();
  };

  return (
    <Form.Root onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <Form.Field name="name">
        <div className="space-y-2">
          <Form.Label className="text-sm font-medium">Sim Name</Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter sim name"
            />
          </Form.Control>
          <Form.Message match="valueMissing" className="text-sm text-red-500">
            Please enter a name
          </Form.Message>
        </div>
      </Form.Field>

      <Form.Submit asChild>
        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Sim
        </button>
      </Form.Submit>
    </Form.Root>
  );
}; 