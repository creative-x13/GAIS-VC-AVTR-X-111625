// src/services/voice/VoiceService.ts
import { DesignImage, Space, DamageAnalysisReport, StyleSuggestion } from '../../types/project';
import { AppPersona } from '../../types/widget';
import { LiveSession, StartSessionParams } from './types';

/**
 * @interface VoiceService
 * @description Defines the abstract contract for all real-time voice and related AI operations.
 * This service handles the complexities of live voice sessions, image generation, and analysis.
 * Bolt.new will implement this service to communicate with the Gemini API via a secure backend.
 */
export interface VoiceService {
  /**
   * Starts a new live voice session.
   * @param params The configuration parameters for the session.
   * @returns A promise that resolves to a LiveSession object, which is used to manage the connection.
   */
  startSession(params: StartSessionParams): Promise<LiveSession>;

  /**
   * Generates a TTS (Text-to-Speech) audio sample for a given voice.
   * @param voiceName The name of the prebuilt voice to use (e.g., 'Zephyr').
   * @returns A promise that resolves when the audio has finished playing.
   */
  playTtsSample(voiceName: string): Promise<void>;

  /**
   * Analyzes the content of an image to generate a description.
   * @param base64 The base64-encoded image data.
   * @param mimeType The MIME type of the image.
   * @returns A promise that resolves to a string containing the image analysis.
   */
  analyzeImage(base64: string, mimeType: string): Promise<string>;

  /**
   * Analyzes an image to diagnose a potential home repair issue.
   * @param base64 The base64-encoded image data.
   * @param mimeType The MIME type of the image.
   * @returns A promise that resolves to a string containing the diagnosis.
   */
  diagnoseImage(base64: string, mimeType: string): Promise<string>;

  /**
   * Generates a remodeled image based on a base image and a prompt.
   * @param styleName The name of the style being applied.
   * @param prompt The detailed text prompt for the generation.
   * @param baseImage The original image to be remodeled.
   * @param refine A boolean indicating if this is a refinement of an existing design.
   * @returns A promise that resolves to a new DesignImage object.
   */
  generateRemodelImage(styleName: string, prompt: string, baseImage: DesignImage, refine: boolean): Promise<DesignImage>;
  
  /**
   * Generates an image visualizing a repair or replacement.
   * @param prompt The detailed text prompt for the visualization.
   * @param baseImage The original image to be edited.
   * @returns A promise that resolves to a new DesignImage object.
   */
  visualizeRepairImage(prompt: string, baseImage: DesignImage): Promise<DesignImage>;

  /**
   * Captures a still photo from a live video stream.
   * @param videoElement The HTMLVideoElement to capture from.
   * @returns A promise that resolves to a new DesignImage object.
   */
  capturePhotoFromVideo(videoElement: HTMLVideoElement): Promise<DesignImage>;

  /**
   * Processes an uploaded image file.
   * @param file The image file uploaded by the user.
   * @returns A promise that resolves to a new DesignImage object.
   */
  processUploadedPhoto(file: File): Promise<DesignImage>;

  // --- Water Damage Restoration Workflow ---

  /**
   * Analyzes a water-damaged image and returns a structured report. (Phase 1)
   * @param base64 The base64-encoded image data.
   * @param mimeType The MIME type of the image.
   * @returns A promise that resolves to a DamageAnalysisReport object.
   */
  getDamageAnalysis(base64: string, mimeType: string): Promise<DamageAnalysisReport>;

  /**
   * Generates a "cleaned slate" image from a damaged one and a report. (Phase 2)
   * @param baseImage The original, damaged image.
   * @param report The analysis report from Phase 1.
   * @returns A promise that resolves to a new DesignImage of the cleaned room.
   */
  generateCleanedImage(baseImage: DesignImage, report: DamageAnalysisReport): Promise<DesignImage>;

  /**
   * Generates a fully remodeled image from a "cleaned slate" image. (Phase 3)
   * @param cleanedImage The "cleaned slate" image from Phase 2.
   * @param report The analysis report from Phase 1 (for architectural context).
   * @param styleName The name of the style being applied.
   * @param stylePrompt The detailed text prompt for the remodel.
   * @returns A promise that resolves to a new, fully remodeled DesignImage.
   */
  generateRemodelFromCleanedImage(cleanedImage: DesignImage, report: DamageAnalysisReport, styleName: string, stylePrompt: string): Promise<DesignImage>;

  /**
   * Generates contextual style suggestions based on a damage report.
   * @param report The analysis report from Phase 1.
   * @returns A promise that resolves to an array of StyleSuggestion objects.
   */
  getStyleSuggestions(report: DamageAnalysisReport): Promise<StyleSuggestion[]>;
}
