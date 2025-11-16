// src/services/memory/MemoryService.ts
import { SessionMemory, UserMemory, CreateSessionParams, ArchivedSession, HistoryQuery } from './types';

/**
 * @interface MemoryService
 * @description Defines the abstract contract for data persistence and state management.
 * This service is responsible for handling short-term session memory and long-term user data.
 * Bolt.new will implement this service using a production database (e.g., Supabase/Postgres).
 */
export interface MemoryService {
  /** --- Session Memory Operations (Short-term) --- */

  /**
   * Creates and stores a new session in memory.
   * @param params Parameters required to create a new session.
   * @returns A promise that resolves to the newly created SessionMemory object.
   */
  createSession(params: CreateSessionParams): Promise<SessionMemory>;

  /**
   * Retrieves an active session by its ID.
   * @param sessionId The unique identifier for the session.
   * @returns A promise that resolves to the SessionMemory object or null if not found.
   */
  getSession(sessionId: string): Promise<SessionMemory | null>;

  /**
   * Updates an active session with new data.
   * @param sessionId The ID of the session to update.
   * @param updates A partial object of the session data to be updated.
   * @returns A promise that resolves when the update is complete.
   */
  updateSession(sessionId: string, updates: Partial<SessionMemory>): Promise<void>;

  /**
   * Ends an active session and archives it.
   * @param sessionId The ID of the session to end.
   * @returns A promise that resolves to the archived session data.
   */
  endSession(sessionId: string): Promise<ArchivedSession>;

  /** --- User Memory Operations (Long-term) --- */

  /**
   * Retrieves the long-term memory for a specific user.
   * @param userId The unique identifier for the user.
   * @returns A promise that resolves to the user's UserMemory object.
   */
  getUserMemory(userId: string): Promise<UserMemory>;

  /**
   * Updates a user's long-term preferences and settings.
   * @param userId The ID of the user to update.
   * @param prefs A partial object of the user memory data to be updated.
   * @returns A promise that resolves when the update is complete.
   */
  updateUserPreferences(userId: string, prefs: Partial<UserMemory>): Promise<void>;

  /**
   * Retrieves a user's conversation history.
   * @param userId The user's unique identifier.
   * @param options Query options for filtering and pagination.
   * @returns A promise that resolves to an array of archived sessions.
   */
  getConversationHistory(userId: string, options: HistoryQuery): Promise<ArchivedSession[]>;
}
