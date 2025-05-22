import type { LLMProvider, Sim, LLMFunction } from '../types/simulation';
import OpenAI from 'openai';

export class LLMService {
  private provider: LLMProvider;
  private openai: OpenAI | null = null;

  constructor(provider: LLMProvider) {
    this.provider = provider;
    if (provider.name === 'openai') {
      this.openai = new OpenAI({
        apiKey: provider.apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  private async callOpenAI(
    sim: Sim,
    availableFunctions: LLMFunction[],
    rules: string[]
  ): Promise<string> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const messages = [
      {
        role: 'system',
        content: `You are a simulation participant named ${sim.name}. You have the following context:\n${
          sim.contextLog.join('\n')
        }\n\nYou must follow these rules:\n${rules.join('\n')}`
      },
      {
        role: 'user',
        content: 'What would you like to do next?'
      }
    ];

    const functions = availableFunctions.map(fn => ({
      name: fn.name,
      description: fn.description,
      parameters: fn.parameters
    }));

    const response = await this.openai.chat.completions.create({
      model: this.provider.model,
      messages,
      functions,
      function_call: 'auto'
    });

    const message = response.choices[0].message;
    if (message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);
      const fn = availableFunctions.find(f => f.name === functionName);
      if (fn) {
        fn.execute(functionArgs as Record<string, unknown>);
      }
    }

    return message.content || '';
  }

  async getSimAction(
    sim: Sim,
    availableFunctions: LLMFunction[],
    rules: string[]
  ): Promise<string> {
    switch (this.provider.name) {
      case 'openai':
        return this.callOpenAI(sim, availableFunctions, rules);
      default:
        throw new Error(`Unsupported LLM provider: ${this.provider.name}`);
    }
  }
}

export const createLLMFunctions = (updateSimContext: (simId: string, message: string) => void): LLMFunction[] => {
  return [
    {
      name: 'addContextToSim',
      description: 'Add a message to a sim\'s context log',
      parameters: {
        type: 'object',
        properties: {
          targetSimId: {
            type: 'string',
            description: 'The ID of the sim to add context to'
          },
          message: {
            type: 'string',
            description: 'The message to add to the sim\'s context'
          }
        },
        required: ['targetSimId', 'message']
      },
      execute: (params: Record<string, unknown>) => {
        const { targetSimId, message } = params as { targetSimId: string; message: string };
        updateSimContext(targetSimId, message);
      }
    }
  ];
}; 