// src/services/credit/types.ts

export type UnsubscribeFunction = () => void;

export type UserTier = "basic" | "professional" | "enterprise";

export interface CostEstimationParams {
  agentId: string;
  estimatedDuration: number; // in minutes
  tier: UserTier;
  features: string[];
}

export interface CreditEstimate {
  estimatedCredits: number;
  breakdown: {
    baseRate: number;
    tierMultiplier: number;
    agentMultiplier: number;
    featureCosts: Record<string, number>;
  };
  minimumRequired: number;
  recommendedBuffer: number;
}

export interface DeductionParams {
  userId: string;
  amount: number;
  operationType: string; // "voice_session", "custom_agent_creation", etc.
  metadata: {
    sessionId?: string;
    agentId?: string;
    duration?: number; // in seconds
    timestamp: number;
  };
}

export interface DeductionResult {
  success: boolean;
  newBalance: number;
  transactionId: string;
  creditsDeducted: number;
  error?: string;
}

export interface AdditionParams {
    userId: string;
    amount: number;
    source: string; // "purchase", "promo_code", "refund"
    metadata?: Record<string, any>;
}

export interface AdditionResult {
    success: boolean;
    newBalance: number;
    transactionId: string;
}
