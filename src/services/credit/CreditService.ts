// src/services/credit/CreditService.ts
import { CreditEstimate, CostEstimationParams, DeductionParams, DeductionResult, AdditionParams, AdditionResult, UnsubscribeFunction } from './types';

/**
 * @interface CreditService
 * @description Defines the abstract contract for all credit and payment-related operations.
 * This interface separates the business logic from the payment provider implementation.
 * Bolt.new will provide the production implementation of this service, integrating
 * with a real payment processor like Stripe.
 */
export interface CreditService {
  /** --- Query Operations (Read-only) --- */
  
  /**
   * Retrieves the current credit balance for a given user.
   * @param userId The unique identifier for the user.
   * @returns A promise that resolves to the user's current credit balance.
   */
  getCurrentBalance(userId: string): Promise<number>;

  /**
   * Estimates the cost of a voice session or other operation in credits.
   * This is a pure calculation and should not have side effects.
   * @param params The parameters needed for cost estimation (e.g., duration, tier).
   * @returns A CreditEstimate object with a breakdown of the costs.
   */
  estimateCost(params: CostEstimationParams): CreditEstimate;

  /**
   * Checks if a user can afford a certain operation.
   * @param userId The user's unique identifier.
   * @param estimatedCost The estimated number of credits required.
   * @returns A promise that resolves to true if the user has sufficient credits, false otherwise.
   */
  canAfford(userId: string, estimatedCost: number): Promise<boolean>;
  
  /** --- Command Operations (State-changing) --- */

  /**
   * Deducts a specified amount of credits from a user's balance.
   * This should be an atomic operation in the production implementation.
   * @param params The parameters for the deduction, including user, amount, and metadata.
   * @returns A promise that resolves with the result of the deduction.
   */
  deductCredits(params: DeductionParams): Promise<DeductionResult>;

  /**
   * Adds a specified amount of credits to a user's balance.
   * In production, this would typically be triggered by a payment webhook.
   * @param params The parameters for the addition, including user and amount.
   * @returns A promise that resolves with the result of the addition.
   */
  addCredits(params: AdditionParams): Promise<AdditionResult>;

  /** --- Real-Time Subscriptions --- */
  
  /**
   * Subscribes to real-time updates of a user's credit balance.
   * @param userId The user's unique identifier.
   * @param callback The function to call whenever the balance changes.
   * @returns An unsubscribe function to clean up the subscription.
   */
  subscribeToBalance(userId: string, callback: (balance: number) => void): UnsubscribeFunction;
}
