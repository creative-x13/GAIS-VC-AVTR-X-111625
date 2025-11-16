// src/types/agent.ts

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  voiceType: string; // e.g., 'Zephyr', 'Kore'
  language: string;
  personality: string;
  costMultiplier: number; // 1.0 = standard, 1.5 = premium, etc.
  requiredTier: "basic" | "professional" | "enterprise";
  customizable: boolean;
  previewAudioUrl?: string;
}

export interface BusinessMatch {
  name: string;
  address: string;
  placeId: string;
}

export interface LeadDetails {
  name?: string;
  phone?: string;
  email?: string;
}
