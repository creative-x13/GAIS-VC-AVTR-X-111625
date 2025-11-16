// src/services/memory/MockMemoryServiceImpl.ts
import { MemoryService } from './MemoryService';
import { SessionMemory, UserMemory, CreateSessionParams, ArchivedSession, HistoryQuery, Message } from './types';
import { UserTier } from '../credit/types';

/**
 * @class MockMemoryServiceImpl
 * @description A mock implementation of MemoryService for prototyping.
 * It uses in-memory Maps to simulate a database for session and user data.
 * This is crucial for stateful testing in Google AI Studio.
 * Bolt.new will replace this with a production database implementation.
 */
export class MockMemoryServiceImpl implements MemoryService {
  private activeSessions = new Map<string, SessionMemory>();
  private userMemories = new Map<string, UserMemory>();

  constructor() {
    // Initialize with a default user for prototyping
    this.userMemories.set('user_default', {
      userId: 'user_default',
      tier: 'professional' as UserTier,
      favoriteAgents: [],
      conversationHistoryArchive: [],
      totalCreditsUsed: 0,
      averageSessionLength: 0,
      preferredVoiceSettings: { voiceId: 'Zephyr' },
      widgetConfigurations: [],
      customAgents: [],
    });
  }

  async createSession(params: CreateSessionParams): Promise<SessionMemory> {
    const session: SessionMemory = {
      ...params,
      conversationHistory: [],
      creditBalance: 1000, // Should be fetched from CreditService in a real app
      creditsUsedThisSession: 0,
      sessionStartTime: new Date(),
      audioStreamState: 'active',
      transcriptionBuffer: [],
    };
    this.activeSessions.set(session.sessionId, session);
    return Promise.resolve(session);
  }

  async getSession(sessionId: string): Promise<SessionMemory | null> {
    return Promise.resolve(this.activeSessions.get(sessionId) || null);
  }

  async updateSession(sessionId: string, updates: Partial<SessionMemory>): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.activeSessions.set(sessionId, { ...session, ...updates });
    }
    return Promise.resolve();
  }

  async endSession(sessionId: string): Promise<ArchivedSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found.`);
    }

    const archivedSession: ArchivedSession = {
      sessionId: session.sessionId,
      userId: session.userId,
      agentId: session.selectedAgentId,
      startTime: session.sessionStartTime,
      endTime: new Date(),
      duration: (new Date().getTime() - session.sessionStartTime.getTime()) / 1000,
      transcript: session.conversationHistory,
      creditsUsed: session.creditsUsedThisSession,
      summary: this.generateSummary(session.conversationHistory),
    };

    const userMemory = await this.getUserMemory(session.userId);
    userMemory.conversationHistoryArchive.push(archivedSession);
    this.activeSessions.delete(sessionId);

    return Promise.resolve(archivedSession);
  }

  async getUserMemory(userId: string): Promise<UserMemory> {
    const memory = this.userMemories.get(userId);
    if (!memory) {
      // Create a default memory for a new user
      const newMemory: UserMemory = {
        userId,
        tier: 'basic' as UserTier,
        favoriteAgents: [],
        conversationHistoryArchive: [],
        totalCreditsUsed: 0,
        averageSessionLength: 0,
        preferredVoiceSettings: { voiceId: 'Zephyr' },
        widgetConfigurations: [],
        customAgents: [],
      };
      this.userMemories.set(userId, newMemory);
      return Promise.resolve(newMemory);
    }
    return Promise.resolve(memory);
  }

  async updateUserPreferences(userId: string, prefs: Partial<UserMemory>): Promise<void> {
    const memory = await this.getUserMemory(userId);
    this.userMemories.set(userId, { ...memory, ...prefs });
    return Promise.resolve();
  }

  async getConversationHistory(userId: string, options: HistoryQuery): Promise<ArchivedSession[]> {
    const memory = await this.getUserMemory(userId);
    // Mock pagination/filtering
    const limit = options.limit || 10;
    const startIndex = (options.page - 1) * limit;
    const endIndex = startIndex + limit;
    return Promise.resolve(memory.conversationHistoryArchive.slice(startIndex, endIndex));
  }

  private generateSummary(history: Message[]): string {
    if (history.length === 0) return "No conversation.";
    const userMessages = history.filter(m => m.role === 'user').length;
    const agentMessages = history.filter(m => m.role === 'agent').length;
    return `A conversation with ${userMessages} user messages and ${agentMessages} agent messages.`;
  }
}
