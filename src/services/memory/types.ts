// src/services/memory/types.ts
import { UserTier } from "../credit/types";

export interface Message {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  confidence?: number;
}

export interface SessionMemory {
  sessionId: string;
  userId: string;
  selectedAgentId: string;
  conversationHistory: Message[];
  creditBalance: number;
  creditsUsedThisSession: number;
  sessionStartTime: Date;
  estimatedEndTime?: Date;
  audioStreamState: 'active' | 'paused' | 'ended';
  transcriptionBuffer: string[];
}

export interface UserMemory {
  userId: string;
  tier: UserTier;
  favoriteAgents: string[];
  conversationHistoryArchive: ArchivedSession[];
  totalCreditsUsed: number;
  averageSessionLength: number; // in seconds
  preferredVoiceSettings: VoiceConfig;
  widgetConfigurations: WidgetConfig[];
  customAgents: CustomAgent[];
}

export interface VoiceConfig {
    voiceId: string;
    // other settings like pitch, speed can go here
}

export interface WidgetConfig {
    id: string;
    name: string;
    // settings like position, color, etc.
}

export interface CustomAgent {
    id: string;
    name: string;
    // custom instructions, etc.
}

export interface CreateSessionParams {
  sessionId: string;
  userId: string;
  selectedAgentId: string;
}

export interface ArchivedSession {
  sessionId: string;
  userId: string;
  agentId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  transcript: Message[];
  creditsUsed: number;
  summary: string;
}

export interface HistoryQuery {
  page: number;
  limit: number;
  sortBy?: 'date' | 'duration';
  sortOrder?: 'asc' | 'desc';
}
