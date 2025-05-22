export interface Sim {
  id: string;
  name: string;
  contextLog: string[];
}

export interface SimulationSettings {
  speed: number;
  allowRatedContent: boolean;
  allowXRatedContent: boolean;
  ruleSet: string;
  customRules: string[];
}

export interface SimulationState {
  isRunning: boolean;
  sims: Sim[];
}

export interface LLMProvider {
  name: string;
  apiKey: string;
  model: string;
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