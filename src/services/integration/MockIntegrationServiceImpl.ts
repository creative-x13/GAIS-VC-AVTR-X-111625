// src/services/integration/MockIntegrationServiceImpl.ts
import { IntegrationService } from './IntegrationService';
import { Webhook, NewWebhook, WebhookEvent } from '../../types/integration';

// Helper for HMAC-SHA256 signature using the Web Crypto API
async function createSignature(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}


/**
 * @class MockIntegrationServiceImpl
 * @description A mock implementation of IntegrationService for prototyping. It manages
 * webhooks in-memory and simulates sending them via `fetch`.
 * Bolt.new will replace this with a production implementation.
 */
export class MockIntegrationServiceImpl implements IntegrationService {
    private webhooks = new Map<string, Webhook[]>();

    async getWebhooks(customerId: string): Promise<Webhook[]> {
        return Promise.resolve(this.webhooks.get(customerId) || []);
    }

    async addWebhook(customerId: string, webhookData: NewWebhook): Promise<Webhook> {
        if (!this.webhooks.has(customerId)) {
            this.webhooks.set(customerId, []);
        }
        const newWebhook: Webhook = {
            id: `wh_${Date.now()}`,
            ...webhookData,
            signingSecret: `whsec_${crypto.randomUUID().replace(/-/g, '')}`,
            createdAt: new Date().toISOString(),
        };
        this.webhooks.get(customerId)!.push(newWebhook);
        return Promise.resolve(newWebhook);
    }

    async deleteWebhook(customerId: string, webhookId: string): Promise<void> {
        const userWebhooks = this.webhooks.get(customerId) || [];
        this.webhooks.set(customerId, userWebhooks.filter(wh => wh.id !== webhookId));
        return Promise.resolve();
    }
    
    private async sendRequest(webhook: Webhook, event: WebhookEvent, payload: any) {
        const body = JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            payload,
        });
        const signature = await createSignature(webhook.signingSecret, body);

        return fetch(webhook.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Remodeling-Live-Signature': signature,
            },
            body: body,
        });
    }

    async testWebhook(customerId: string, webhookId: string): Promise<{ success: boolean; message: string; }> {
        const webhook = this.webhooks.get(customerId)?.find(wh => wh.id === webhookId);
        if (!webhook) {
            return { success: false, message: "Webhook not found." };
        }
        
        try {
            const response = await this.sendRequest(webhook, 'lead_captured', {
                name: "Test Lead",
                phone: "555-555-5555",
                isTest: true
            });

            if (response.ok) {
                return { success: true, message: `Successfully sent test. Endpoint responded with status ${response.status}.`};
            } else {
                return { success: false, message: `Endpoint responded with an error: Status ${response.status}.`};
            }

        } catch (error) {
            console.error("Test webhook failed:", error);
            return { success: false, message: `Request failed. Check URL and CORS policy.` };
        }
    }

    async triggerWebhookEvent(customerId: string, event: WebhookEvent, payload: any): Promise<void> {
        const webhooksToSend = (this.webhooks.get(customerId) || []).filter(wh => wh.events.includes(event));
        
        for (const webhook of webhooksToSend) {
            try {
                await this.sendRequest(webhook, event, payload);
                console.log(`[Webhook] Successfully sent '${event}' to ${webhook.url}`);
            } catch (error) {
                console.error(`[Webhook] Failed to send '${event}' to ${webhook.url}:`, error);
            }
        }
    }
}
