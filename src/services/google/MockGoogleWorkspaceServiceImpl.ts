// src/services/google/MockGoogleWorkspaceServiceImpl.ts
import { GoogleWorkspaceService } from './GoogleWorkspaceService';
import { CalendarEvent } from './types';

/**
 * @class MockGoogleWorkspaceServiceImpl
 * @description A mock implementation of GoogleWorkspaceService for prototyping.
 * It simulates the connection flow and logs actions to the console.
 * This allows for frontend development without needing a real OAuth 2.0 backend.
 * Bolt.new will replace this with a production implementation.
 */
export class MockGoogleWorkspaceServiceImpl implements GoogleWorkspaceService {
  private isConnected = false;

  async connect(): Promise<boolean> {
    console.log('[MockGoogleWorkspaceService] Simulating OAuth flow...');
    return new Promise(resolve => {
      setTimeout(() => {
        this.isConnected = true;
        console.log('[MockGoogleWorkspaceService] Successfully connected.');
        resolve(true);
      }, 1000); // Simulate network delay
    });
  }

  disconnect(): void {
    if (this.isConnected) {
      this.isConnected = false;
      console.log('[MockGoogleWorkspaceService] Disconnected.');
    }
  }

  async createCalendarEvent(eventDetails: CalendarEvent): Promise<void> {
    if (!this.isConnected) {
      throw new Error("Cannot create calendar event: Google account is not connected.");
    }
    
    console.log('[MockGoogleWorkspaceService] Creating Calendar Event with details:');
    console.table(eventDetails);
    
    return Promise.resolve();
  }

  async appendToGoogleSheet(sheetId: string, data: any): Promise<void> {
    console.log(`
      ==================================================
      [MockGoogleWorkspaceService] SIMULATING APPEND TO GOOGLE SHEET
      --------------------------------------------------
      SHEET ID: ${sheetId}
      --------------------------------------------------
      DATA TO APPEND:
      ${JSON.stringify(data, null, 2)}
      ==================================================
    `);
    return Promise.resolve();
  }
}