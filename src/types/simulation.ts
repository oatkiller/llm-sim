export interface Sim {
  id: string;
  name: string;
  contextLog: string[];
  traits: Record<string, number>;
  createdAt: number;
  lastUpdated: number;
}

export interface SimulationSettings {
  speed: number;
  allowRatedContent: boolean;
  allowXRatedContent: boolean;
  ruleSet: string;
  customRules: string[];
}

export interface SimulationState {
  sims: Sim[];
  settings: SimulationSettings;
  tick: number;
  isRunning: boolean;
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
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => void;
}

export interface RuleSet {
  id: string;
  name: string;
  description: string;
  rules: string[];
} 