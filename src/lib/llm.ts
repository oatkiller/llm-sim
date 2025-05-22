import type { LLMProvider, Simulation, LLMFunction } from '../types/simulation';
import OpenAI from 'openai';
import { getDefaultStore } from 'jotai';
import { debugModeAtom, pendingMessagesAtom, type PendingMessage } from '../store/debug';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class LLMService {
  private provider: LLMProvider;
  private openai: OpenAI | null = null;

  constructor(provider: LLMProvider) {
    this.provider = provider;
    if (provider.type === 'openai') {
      this.openai = new OpenAI({
        apiKey: provider.apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  async testConnection(): Promise<{ duration: number; tokens: number }> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const startTime = Date.now();
    const response = await this.openai.chat.completions.create({
      model: this.provider.model,
      messages: [{ role: 'user', content: 'Test connection' }],
      max_tokens: 5
    });

    const duration = Date.now() - startTime;
    const tokens = response.usage?.total_tokens || 0;

    return { duration, tokens };
  }

  private async callOpenAI(
    sim: Simulation,
    availableFunctions: LLMFunction[],
    rules: string[]
  ): Promise<string> {
    if (!this.openai) throw new Error('OpenAI client not initialized');

    const messages: ChatCompletionMessageParam[] = [
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

  private async interceptMessage(
    sim: Simulation,
    content: string,
    onApprove: (content: string) => void
  ): Promise<string> {
    const store = getDefaultStore();
    const debugMode = store.get(debugModeAtom);

    if (!debugMode) {
      return content;
    }

    return new Promise((resolve) => {
      const message: PendingMessage = {
        id: crypto.randomUUID(),
        simName: sim.name,
        content,
        timestamp: Date.now(),
        onApprove: (approvedContent) => {
          resolve(approvedContent);
        }
      };

      store.set(pendingMessagesAtom, (prev) => [...prev, message]);
    });
  }

  async getSimAction(
    sim: Simulation,
    availableFunctions: LLMFunction[],
    rules: string[]
  ): Promise<string> {
    let content: string;
    switch (this.provider.type) {
      case 'openai':
        content = await this.callOpenAI(sim, availableFunctions, rules);
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${this.provider.type}`);
    }

    return this.interceptMessage(sim, content, (approvedContent) => {
      // The content has been approved and potentially modified
      return approvedContent;
    });
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