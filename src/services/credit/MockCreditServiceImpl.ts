// src/services/credit/MockCreditServiceImpl.ts
import { CreditService } from './CreditService';
import { CreditEstimate, CostEstimationParams, DeductionParams, DeductionResult, AdditionParams, AdditionResult, UnsubscribeFunction } from './types';

/**
 * @class MockCreditServiceImpl
 * @description Provides a mock implementation of the CreditService for prototyping.
 * It manages credit balances in-memory and simulates API calls.
 * This allows for frontend development without a live payment system.
 * Bolt.new will replace this with a production implementation.
 */
export class MockCreditServiceImpl implements CreditService {
  private balances = new Map<string, number>();
  private listeners = new Map<string, ((balance: number) => void)[]>();

  constructor() {
    // Initialize with a default user for prototyping
    this.balances.set('user_default', 1000);
  }

  async getCurrentBalance(userId: string): Promise<number> {
    if (!this.balances.has(userId)) {
      this.balances.set(userId, 1000); // Default balance for new users
    }
    return Promise.resolve(this.balances.get(userId)!);
  }

  estimateCost(params: CostEstimationParams): CreditEstimate {
    // This is a pure calculation, safe to implement fully for the prototype.
    const baseRate = 10; // Abstract credits per minute
    const tierMultipliers = { basic: 1.0, professional: 2.5, enterprise: 5.0 };
    
    // In a real app, this would be looked up from agent config
    const agentMultipliers: Record<string, number> = { 'premium_agent_1': 1.5 };

    const tierMultiplier = tierMultipliers[params.tier];
    const agentMultiplier = agentMultipliers[params.agentId] || 1.0;

    const baseCredits = baseRate * params.estimatedDuration;
    const tierAdjusted = baseCredits * tierMultiplier;
    const agentAdjusted = tierAdjusted * agentMultiplier;

    const featureCosts = params.features.reduce((acc, feature) => {
      // Dummy cost calculation for features
      acc[feature] = feature.length * 5; // e.g., 'custom-voice-tuning' costs more
      return acc;
    }, {} as Record<string, number>);

    const totalFeatureCost = Object.values(featureCosts).reduce((a, b) => a + b, 0);
    const estimatedCredits = Math.ceil(agentAdjusted + totalFeatureCost);

    return {
      estimatedCredits,
      breakdown: {
        baseRate,
        tierMultiplier,
        agentMultiplier,
        featureCosts
      },
      minimumRequired: estimatedCredits,
      recommendedBuffer: Math.ceil(estimatedCredits * 0.2) // 20% buffer
    };
  }

  async canAfford(userId: string, estimatedCost: number): Promise<boolean> {
    const balance = await this.getCurrentBalance(userId);
    return balance >= estimatedCost;
  }

  async deductCredits(params: DeductionParams): Promise<DeductionResult> {
    const currentBalance = await this.getCurrentBalance(params.userId);

    if (currentBalance < params.amount) {
      return {
        success: false,
        newBalance: currentBalance,
        transactionId: "",
        creditsDeducted: 0,
        error: "Insufficient credits"
      };
    }

    const newBalance = currentBalance - params.amount;
    this.balances.set(params.userId, newBalance);
    this.notifyListeners(params.userId, newBalance);

    return {
      success: true,
      newBalance,
      transactionId: `mock_txn_${Date.now()}`,
      creditsDeducted: params.amount
    };
  }
  
  async addCredits(params: AdditionParams): Promise<AdditionResult> {
    const currentBalance = await this.getCurrentBalance(params.userId);
    const newBalance = currentBalance + params.amount;
    this.balances.set(params.userId, newBalance);
    this.notifyListeners(params.userId, newBalance);

    return {
        success: true,
        newBalance,
        transactionId: `mock_add_${Date.now()}`
    };
  }

  subscribeToBalance(userId: string, callback: (balance: number) => void): UnsubscribeFunction {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }
    this.listeners.get(userId)!.push(callback);

    // Immediately call with current balance
    this.getCurrentBalance(userId).then(callback);

    return () => {
      const callbacks = this.listeners.get(userId) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  private notifyListeners(userId: string, newBalance: number) {
    const callbacks = this.listeners.get(userId) || [];
    callbacks.forEach(cb => cb(newBalance));
  }
}
