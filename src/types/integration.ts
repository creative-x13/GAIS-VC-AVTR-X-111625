// src/types/integration.ts

export type WebhookEvent = 'lead_captured' | 'report_sent' | 'consultation_scheduled';

export const WEBHOOK_EVENTS: { id: WebhookEvent, label: string, description: string }[] = [
    { id: 'lead_captured', label: 'Lead Captured', description: 'Triggers when agent successfully captures a name and phone number.' },
    { id: 'report_sent', label: 'Report Sent', description: 'Triggers when agent sends a design or conversation summary report.' },
    { id: 'consultation_scheduled', label: 'Consultation Scheduled', description: 'Triggers when agent successfully schedules a Google Calendar event.' },
];

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  signingSecret: string;
  createdAt: string;
}

export type NewWebhook = Omit<Webhook, 'id' | 'signingSecret' | 'createdAt'>;
