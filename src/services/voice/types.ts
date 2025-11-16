// src/services/voice/types.ts
import { FunctionDeclaration, FunctionCall } from '@google/genai';
import { AppPersona } from '../../types/widget';

export type LiveStatus = 'inactive' | 'connecting' | 'active' | 'error';

export interface StartSessionParams {
  videoElement: HTMLVideoElement | null;
  systemInstruction: string;
  tools: FunctionDeclaration[];
  agentVoice: string;
  appPersona: AppPersona;
  onStatusChanged: (status: LiveStatus) => void;
  onClose: () => void;
  onTranscriptionUpdate: (currentUserText: string, currentModelText: string) => void;
  onTurnCompleted: (finalUserText: string, finalModelText: string) => void;
  onToolCall: (fc: FunctionCall) => Promise<string>;
}

export interface LiveSession {
  /** Closes the connection and cleans up all associated resources. */
  close: () => void;
  /** Sends a text message to the session, often for system-level events. */
  sendSystemMessage: (text: string) => void;
}
