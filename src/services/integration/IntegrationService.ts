// src/services/integration/IntegrationService.ts
import { Webhook, NewWebhook, WebhookEvent } from '../../types/integration';

/**
 * @interface IntegrationService
 * @description Defines the abstract contract for third-party integrations, like webhooks.
 * Bolt.new will provide the production implementation of this service.
 */
export interface IntegrationService {
  getWebhooks(customerId: string): Promise<Webhook[]>;
  addWebhook(customerId: string, webhook: NewWebhook): Promise<Webhook>;
  deleteWebhook(customerId: string, webhookId: string): Promise<void>;
  testWebhook(customerId: string, webhookId: string): Promise<{ success: boolean; message: string }>;
  triggerWebhookEvent(customerId: string, event: WebhookEvent, payload: any): Promise<void>;
}
