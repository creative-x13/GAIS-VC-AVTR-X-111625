// src/services/google/GoogleWorkspaceService.ts
import { CalendarEvent } from './types';

/**
 * @interface GoogleWorkspaceService
 * @description Defines the abstract contract for interacting with Google Workspace APIs.
 * This service handles authentication and actions like creating calendar events.
 * Bolt.new will provide the production implementation of this service, handling
 * the server-side OAuth 2.0 flow and secure API calls.
 */
export interface GoogleWorkspaceService {
  /**
   * Initiates the connection to the user's Google account.
   * In a real implementation, this would trigger an OAuth 2.0 flow.
   * @returns A promise that resolves to true on successful connection, false otherwise.
   */
  connect(): Promise<boolean>;

  /**
   * Disconnects the user's Google account and revokes access.
   */
  disconnect(): void;

  /**
   * Creates a new event on the user's primary Google Calendar.
   * @param eventDetails The details of the event to be created.
   * @returns A promise that resolves when the event has been successfully created.
   */
  createCalendarEvent(eventDetails: CalendarEvent): Promise<void>;

  /**
   * Appends a row of data to a specified Google Sheet.
   * @param sheetId The ID of the Google Sheet.
   * @param data The structured data object to append.
   * @returns A promise that resolves when the data has been successfully appended.
   */
  appendToGoogleSheet(sheetId: string, data: any): Promise<void>;
}