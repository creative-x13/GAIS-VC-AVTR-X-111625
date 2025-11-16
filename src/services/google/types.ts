// src/services/google/types.ts

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  isoStartTime: string;
  isoEndTime: string;
}
