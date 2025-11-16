// src/services/voice/MockVoiceServiceImpl.ts
import { GoogleGenAI, Modality, LiveServerMessage, Blob as GenAI_Blob, FunctionDeclaration, Type } from '@google/genai';
import { VoiceService } from './VoiceService';
import { LiveSession, StartSessionParams } from './types';
import { DamageAnalysisReport, DesignImage, StyleSuggestion } from '../../types/project';
import * as Config from '../../config/remodelingLiveConfig';
import { encode, decode, decodeAudioData } from '../../lib/utils/audioUtils';
import { fileToBase64 } from '../../lib/utils/fileUtils';

const sanitizeJsonResponse = (text: string): string => text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
/**
 * @class MockVoiceServiceImpl
 * @description A mock implementation of VoiceService for prototyping in Google AI Studio.
 * It directly calls the Gemini Live and Imagen APIs.
 * Bolt.new will replace this with a production implementation that calls a secured backend.
 */
export class MockVoiceServiceImpl implements VoiceService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async playTtsSample(voiceName: string): Promise<void> {
    const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `This is a sample of the selected voice.` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName, languageCode: 'en-US' } } },
        },
    });
    
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("API did not return audio data for TTS.");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decode(audioData), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }

  async analyzeImage(base64: string, mimeType: string): Promise<string> {
    const prompt = "You are an expert interior designer. Analyze this image of a room and provide a concise, one-sentence description of its key features. For example: 'This is a kitchen with white shaker cabinets, stainless steel appliances, and a central island.' Do not add any conversational filler.";
    const imagePart = { inlineData: { mimeType, data: base64 } };
    const textPart = { text: prompt };
    const response = await this.ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [imagePart, textPart] } });
    return response.text;
  }
  
  async diagnoseImage(base64: string, mimeType: string): Promise<string> {
    const prompt = "You are an expert home repair contractor. Analyze the provided image for potential problems. Provide a concise, bulleted list of observations, a likely diagnosis, and a recommendation (e.g., 'Recommend professional inspection'). Prioritize safety. Example: '- Observation: Discoloration around the P-trap under the sink.\n- Diagnosis: Probable slow water leak.\n- Recommendation: Advise user to check for active dripping and recommend contacting a plumber.'";
    const imagePart = { inlineData: { mimeType, data: base64 } };
    const textPart = { text: prompt };
    const response = await this.ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [imagePart, textPart] } });
    return response.text;
  }

  async generateRemodelImage(styleName: string, prompt: string, baseImage: DesignImage, refine: boolean): Promise<DesignImage> {
    const finalPrompt = refine ? Config.REFINE_PROMPT_TEMPLATE(prompt) : Config.REMODEL_PROMPT_TEMPLATE(prompt);
    const response = await this.ai.models.generateContent({
        model: Config.IMAGE_GENERATION_MODEL,
        contents: { parts: [{ inlineData: { mimeType: baseImage.mimeType, data: baseImage.base64 } }, { text: finalPrompt }] },
        config: { responseModalities: [Modality.IMAGE] }
    });
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Failed to generate remodeled image.");
    return {
        dataUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        style: styleName,
        base64: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
    };
  }

  async visualizeRepairImage(prompt: string, baseImage: DesignImage): Promise<DesignImage> {
    const finalPrompt = Config.VISUALIZE_REPAIR_PROMPT_TEMPLATE(prompt);
    const response = await this.ai.models.generateContent({
        model: Config.IMAGE_GENERATION_MODEL,
        contents: { parts: [{ inlineData: { mimeType: baseImage.mimeType, data: baseImage.base64 } }, { text: finalPrompt }] },
        config: { responseModalities: [Modality.IMAGE] }
    });
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Failed to visualize repair.");
    return {
        dataUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        style: `Repair: ${prompt.substring(0, 20)}...`,
        base64: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
    };
  }
  
  async capturePhotoFromVideo(videoElement: HTMLVideoElement): Promise<DesignImage> {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      canvas.getContext('2d')?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      return { dataUrl, style: 'Original', base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
  }
  
  async processUploadedPhoto(file: File): Promise<DesignImage> {
      const dataUrl = await fileToBase64(file);
      return { dataUrl, style: 'Original', base64: dataUrl.split(',')[1], mimeType: file.type };
  }

  async getDamageAnalysis(base64: string, mimeType: string): Promise<DamageAnalysisReport> {
    const imagePart = { inlineData: { mimeType, data: base64 } };
    const textPart = { text: Config.DAMAGE_ANALYSIS_PROMPT };

    const response = await this.ai.models.generateContent({
      model: Config.ADVANCED_MODEL,
      contents: { parts: [imagePart, textPart] },
      config: { responseMimeType: "application/json" },
    });
    
    const sanitizedText = sanitizeJsonResponse(response.text);
    return JSON.parse(sanitizedText);
  }

  async generateCleanedImage(baseImage: DesignImage, report: DamageAnalysisReport): Promise<DesignImage> {
    const prompt = Config.BLANK_SLATE_PROMPT_TEMPLATE(report);
    const response = await this.ai.models.generateContent({
        model: Config.IMAGE_GENERATION_MODEL,
        contents: { parts: [{ inlineData: { mimeType: baseImage.mimeType, data: baseImage.base64 } }, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] }
    });
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Failed to generate cleaned image.");
    return {
        dataUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        style: 'Cleaned Slate',
        base64: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
    };
  }

  async generateRemodelFromCleanedImage(cleanedImage: DesignImage, report: DamageAnalysisReport, styleName: string, stylePrompt: string): Promise<DesignImage> {
    const prompt = Config.TOTAL_REMODEL_PROMPT_TEMPLATE(report, stylePrompt);
    const response = await this.ai.models.generateContent({
        model: Config.IMAGE_GENERATION_MODEL,
        contents: { parts: [{ inlineData: { mimeType: cleanedImage.mimeType, data: cleanedImage.base64 } }, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] }
    });
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("Failed to generate remodeled image from cleaned slate.");
    return {
        dataUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        style: styleName,
        base64: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
    };
  }
  
  async getStyleSuggestions(report: DamageAnalysisReport): Promise<StyleSuggestion[]> {
      const prompt = Config.STYLE_SUGGESTION_PROMPT_TEMPLATE(report);
      const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
      });
      const sanitizedText = sanitizeJsonResponse(response.text);
      return JSON.parse(sanitizedText);
  }

  async startSession(params: StartSessionParams): Promise<LiveSession> {
    const { videoElement, onStatusChanged, onClose, onTranscriptionUpdate, onTurnCompleted, onToolCall, systemInstruction, tools, agentVoice, appPersona } = params;

    let mediaStream: MediaStream | null = null;
    let scriptProcessor: ScriptProcessorNode | null = null;
    let inputAudioContext: AudioContext | null = null;
    let outputAudioContext: AudioContext | null = null;
    let sessionPromise: Promise<any> | null = null;
    
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: appPersona === 'remodeling_consultant' || appPersona === 'contractor_agent' || appPersona === 'water_damage_restoration'
        });
        if (videoElement && (appPersona === 'remodeling_consultant' || appPersona === 'contractor_agent' || appPersona === 'water_damage_restoration')) {
            videoElement.srcObject = mediaStream;
        }

        inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        let nextStartTime = 0;
        let currentInputRef = '';
        let currentOutputRef = '';

        sessionPromise = this.ai.live.connect({
            model: Config.LIVE_AGENT_MODEL,
            callbacks: {
                onopen: () => {
                    onStatusChanged('active');
                    sessionPromise?.then(session => session.sendRealtimeInput({ text: '<user_is_listening>' }));
                    
                    const source = inputAudioContext!.createMediaStreamSource(mediaStream!);
                    scriptProcessor = inputAudioContext!.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (event) => {
                        const inputData = event.inputBuffer.getChannelData(0);
                        const pcmBlob: GenAI_Blob = { data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)), mimeType: 'audio/pcm;rate=16000' };
                        sessionPromise?.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.toolCall) {
                        for (const fc of message.toolCall.functionCalls) {
                            const result = await onToolCall(fc);
                            sessionPromise?.then(session => session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result } } }));
                        }
                    }
                    if (message.serverContent?.inputTranscription) { currentInputRef += message.serverContent.inputTranscription.text; onTranscriptionUpdate(currentInputRef, currentOutputRef); }
                    if (message.serverContent?.outputTranscription) { currentOutputRef += message.serverContent.outputTranscription.text; onTranscriptionUpdate(currentInputRef, currentOutputRef); }
                    if (message.serverContent?.turnComplete) {
                        onTurnCompleted(currentInputRef, currentOutputRef);
                        currentInputRef = ''; currentOutputRef = ''; onTranscriptionUpdate('', '');
                    }
                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext!.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext!, 24000, 1);
                        const source = outputAudioContext!.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext!.destination);
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                    }
                },
                onerror: (e: ErrorEvent) => { console.error('Live session error:', e); onStatusChanged('error'); onClose(); },
                onclose: onClose,
            },
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: tools as FunctionDeclaration[] }],
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: agentVoice } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            }
        });
        
        return {
            close: () => {
                sessionPromise?.then(session => session.close()).catch(console.error);
                mediaStream?.getTracks().forEach(track => track.stop());
                scriptProcessor?.disconnect();
                inputAudioContext?.close().catch(console.error);
                outputAudioContext?.close().catch(console.error);
                if(videoElement) videoElement.srcObject = null;
            },
            sendSystemMessage: (text: string) => {
                sessionPromise?.then(session => session.sendRealtimeInput({ text }));
            }
        };

    } catch (error) {
        console.error('Failed to start session:', error);
        onStatusChanged('error');
        onClose();
        throw error;
    }
  }
}
