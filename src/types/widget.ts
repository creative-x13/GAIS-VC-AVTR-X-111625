// src/types/widget.ts

export type AppPersona = 'remodeling_consultant' | 'live_voice_agent' | 'sales_agent' | 'contractor_agent' | 'water_damage_restoration' | 'ppc_agent' | 'customizable_ppc_agent';
export type WidgetPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'full-screen';
export type WidgetTheme = 'light' | 'dark' | 'custom';
export type WidgetOpenBehavior = 'immediate' | 'delay_15s' | 'delay_30s' | 'manual';

export interface CustomThemeColors {
  primary: string;
  background: string;
  text: string;
  agentBubble: string;
  userBubble: string;
}

export interface TranscriptionEntry {
  speaker: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
}