// src/services/agent/AgentService.ts
import { BusinessMatch, LeadDetails } from '../../types/agent';
import { ProjectData } from '../../types/project';
import { AppPersona, TranscriptionEntry } from '../../types/widget';

export type KbSource = { type: 'url', value: string } | { type: 'business', value: BusinessMatch } | { type: 'file', content: string };

/**
 * @interface AgentService
 * @description Defines the contract for agent-related operations.
 * Bolt.new will implement this service to manage knowledge bases,
 * agent avatars, and other agent configurations in a production environment.
 */
export interface AgentService {
  /**
   * Generates a structured knowledge base from a given source.
   * @param source The source material (URL, business info, or file content).
   * @param onProgress A callback to report progress during generation.
   * @returns A promise that resolves to the generated knowledge base (e.g., in XML format).
   */
  generateKnowledgeBase(source: KbSource, onProgress: (message: string) => void): Promise<string>;

  /**
   * Searches for businesses using Google Maps.
   * @param businessName The name of the business to search for.
   * @param location The location (e.g., "City, State") to search near.
   * @returns A promise that resolves to an array of matching businesses.
   */
  searchBusinesses(businessName: string, location: string): Promise<BusinessMatch[]>;
  
  /**
   * Generates a visual avatar for an agent.
   * @param style The artistic style of the avatar (e.g., 'Photorealistic').
   * @param subject The subject of the avatar (e.g., 'Woman').
   * @param description A detailed description of the avatar's appearance.
   * @returns A promise that resolves to the data URL of the generated image.
   */
  generateAgentAvatar(style: string, subject: string, description: string): Promise<string>;

  /**
   * Analyzes a conversation transcript to generate structured report data.
   * @param transcript The full conversation history.
   * @param persona The persona of the agent in the session.
   * @param leadDetails The captured lead details (name, phone, email).
   * @param projectData Any relevant data from the session (e.g., spaces, diagnosis).
   * @returns A promise that resolves to a structured JSON object for reporting.
   */
  generateReportData(transcript: TranscriptionEntry[], persona: AppPersona, leadDetails: LeadDetails, projectData: ProjectData): Promise<any>;

  /**
   * Generates custom system instructions for a Pay-Per-Call agent.
   * @param details The business details provided by the user.
   * @returns A promise that resolves to the generated system instruction string.
   */
  generatePpcInstructions(details: {
    vertical: string;
    services: string;
    keywords: string;
    phoneNumber: string;
  }): Promise<string>;
}
