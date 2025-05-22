export interface LogEntry {
  timestamp: number;
  type: 'prompt' | 'response' | 'system' | 'simulation';
  content: string;
  metadata?: Record<string, any>;
}

export interface Simulation {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'paused';
  contextLog: LogEntry[];
  currentPrompt?: string;
  speed: number; // 0 means manual, >0 means auto-step every N seconds
  character: {
    name: string;
    traits: string[];
    background: string;
  };
}

export interface SimulationState {
  sims: Simulation[];
  activeSimId?: string;
  nextStepTimer?: number;
}

export interface LLMProvider {
  type: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
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