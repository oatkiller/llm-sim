export interface LogMetadata {
  source?: string;
  confidence?: number;
  tokens?: number;
  model?: string;
  duration?: number;
  error?: string;
}

export interface LogEntry {
  timestamp: number;
  type: 'prompt' | 'response' | 'system' | 'simulation';
  content: string;
  metadata?: Record<string, any>;
}

export interface Character {
  name: string;
  traits: string[];
  background?: string;
  state?: Record<string, any>;
}

export interface Simulation {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'paused';
  contextLog: LogEntry[];
  speed: number;
  currentPrompt?: string;
  character: Character;
}

export interface SimulationState {
  sims: Simulation[];
  activeSimId?: string;
  nextStepTimer?: number;
}

export interface LLMProvider {
  type: 'openai';
  apiKey: string;
  model: string;
}

export interface LLMResponse {
  content: string;
  metadata?: Record<string, any>;
}

export interface CharacterBackgroundResponse {
  background: string;
  state: Record<string, any>;
}

export interface SimulationSettings {
  speed: number;
  allowRatedContent: boolean;
  allowXRatedContent: boolean;
  ruleSet: string;
  customRules: string[];
}

export interface System {
  name: string;
  update: (state: SimulationState) => SimulationState;
}

export interface LLMFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required: string[];
  };
  execute: (params: Record<string, unknown>) => void;
}

export interface RuleSet {
  id: string;
  name: string;
  description: string;
  rules: string[];
} 