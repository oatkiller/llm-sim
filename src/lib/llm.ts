import OpenAI from 'openai';
import type { LLMProvider, LLMResponse, CharacterBackgroundResponse } from '../types/simulation';
import type { SimulationRequest } from '../lib/ecs';

export class LLMService {
  private client: OpenAI;

  constructor(provider: LLMProvider) {
    this.client = new OpenAI({
      apiKey: provider.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async testConnection(): Promise<{ duration: number; tokens: number }> {
    const start = Date.now();
    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Test connection' }],
      max_tokens: 5
    });
    const duration = Date.now() - start;
    const tokens = response.usage?.total_tokens || 0;
    return { duration, tokens };
  }

  async generateCharacterBackground(character: { name: string; traits: string[] }): Promise<CharacterBackgroundResponse> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a character creation system. Generate a detailed background story and initial state for a character with the following traits: ${character.traits.join(', ')}. 
          Return the response in the following JSON format:
          {
            "background": "detailed character background story",
            "state": {
              "key": "value",
              // other character state properties
            }
          }`
        },
        {
          role: 'user',
          content: `Create a background for ${character.name}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    return JSON.parse(content) as CharacterBackgroundResponse;
  }

  async processRequest(request: SimulationRequest): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a simulation system that processes character actions and interactions.'
        },
        {
          role: 'user',
          content: request.content
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    return {
      content,
      metadata: {
        requestId: request.id,
        requestType: request.type,
        timestamp: Date.now()
      }
    };
  }
} 