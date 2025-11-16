import React, { createContext, useState, useCallback, useContext, ReactNode, useRef, useEffect } from 'react';
import { Space, DesignImage, DamageAnalysisReport, StyleSuggestion, ProjectData } from '../types/project';
import { AppPersona, WidgetPosition, WidgetTheme, CustomThemeColors, WidgetOpenBehavior, TranscriptionEntry } from '../types/widget';
import { useService } from '../lib/hooks/useService';
import * as Config from '../config/remodelingLiveConfig';
import { LeadDetails } from '../types/agent';
import { fileToBase64 } from '../lib/utils/fileUtils';
import { KbSource } from '../services/agent/AgentService';
import { LiveSession, StartSessionParams } from '../services/voice/types';
import { CalendarEvent } from '../services/google/types';
import { Webhook, NewWebhook } from '../types/integration';
import { FunctionDeclaration } from '@google/genai';

type AppPhase = 'welcome' | 'consultation' | 'design_studio';
type LiveStatus = 'inactive' | 'connecting' | 'active' | 'error';
type PpcGeneratorStep = 'input' | 'review';

export interface WidgetContextType {
    // App State
    appPhase: AppPhase;
    liveStatus: LiveStatus;
    transcriptionHistory: TranscriptionEntry[];
    currentUserText: string;
    currentModelText: string;
    videoRef: React.RefObject<HTMLVideoElement>;
    spaces: Space[];
    activeSpaceId: string | null;
    selectedImageIndex: number | null;
    isGeneratingRemodel: boolean;
    isAnalyzingImage: boolean;
    isWidgetOpen: boolean;
    isPendingSpaceCreation: boolean;
    diagnosis: string | null;
    damageAnalysisReport: DamageAnalysisReport | null;
    isTranscriptCollapsed: boolean;
    styleSuggestions: StyleSuggestion[];
    isFetchingSuggestions: boolean;
    
    // Actions
    startLiveConsultation: () => Promise<void>;
    endLiveConsultation: (leadDetailsOverride?: LeadDetails) => void;
    openAndStartConsultation: () => void;
    takeAndSetStillPhoto: () => Promise<void>;
    generateStyleRemodel: (styleName: string, stylePrompt: string) => Promise<string>;
    generateWDRemodel: (styleName: string, stylePrompt: string) => Promise<string>;
    handleSendReportAndEnd: (email: string) => Promise<void>;
    setSelectedImageIndex: (index: number | null) => void;
    handleCreateNewSpace: (name: string) => void;
    setActiveSpaceId: (spaceId: string | null) => void;
    handleUploadClick: () => void;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    setIsWidgetOpen: (isOpen: boolean) => void;
    setIsPendingSpaceCreation: (isPending: boolean) => void;
    toggleTranscriptCollapsed: () => void;

    // Agent & Widget Settings
    knowledgeBase: string | null;
    isGeneratingKb: boolean;
    kbGenerationMessage: string;
    kbError: string | null;
    generateKnowledgeBase: (source: KbSource) => Promise<void>;
    clearKnowledgeBase: () => void;
    kbBusinessMatches: any[];
    isSearchingBusinesses: boolean;
    searchBusinessesForKb: (name: string, loc: string) => Promise<void>;
    clearBusinessMatches: () => void;
    agentCustomerId: string;
    appPersona: AppPersona;
    handleSetAppPersona: (persona: AppPersona) => void;
    contractorTrade: string;
    handleSetContractorTrade: (trade: string) => void;
    activeSalesStyle: string;
    handleSetActiveSalesStyle: (styleName: string) => void;
    ppcVertical: string;
    handleSetPpcVertical: (vertical: string) => void;
    // Customizable PPC Agent State
    ppcCustomVertical: string;
    handleSetPpcCustomVertical: (vertical: string) => void;
    ppcServices: string;
    handleSetPpcServices: (services: string) => void;
    ppcKeywords: string;
    handleSetPpcKeywords: (keywords: string) => void;
    customPpcInstructions: string;
    handleSetCustomPpcInstructions: (instructions: string) => void;
    isGeneratingPpcInstructions: boolean;
    ppcGeneratorStep: PpcGeneratorStep;
    handleSetPpcGeneratorStep: (step: PpcGeneratorStep) => void;
    generateAndSetPpcInstructions: () => Promise<void>;
    // End Customizable PPC Agent State
    agentName: string;
    handleSetAgentName: (name: string) => void;
    agentOpeningMessage: string;
    handleSetAgentOpeningMessage: (message: string) => void;
    additionalInstructions: string;
    handleSetAdditionalInstructions: (instructions: string) => void;
    agentVoice: string;
    handleSetAgentVoice: (voice: string) => void;
    playVoiceSample: (voiceName: string) => Promise<void>;
    agentAvatarUrl: string | null;
    isGeneratingAgentAvatar: boolean;
    handleGenerateAgentAvatar: (style: string, subject: string, description: string) => Promise<void>;
    logoUrl: string | null;
    widgetTitle: string;
    phoneNumber: string;
    googleSheetUrl: string;
    handleSetLogo: (file: File) => Promise<void>;
    handleClearLogo: () => void;
    handleSetWidgetTitle: (title: string) => void;
    handleSetPhoneNumber: (phone: string) => void;
    handleSetGoogleSheetUrl: (url: string) => void;
    widgetPosition: WidgetPosition;
    handleSetWidgetPosition: (position: WidgetPosition) => void;
    widgetTheme: WidgetTheme;
    handleSetWidgetTheme: (theme: WidgetTheme) => void;
    customThemeColors: CustomThemeColors;
    handleSetCustomThemeColor: (colorType: keyof CustomThemeColors, value: string) => void;
    isExitIntentEnabled: boolean;
    handleToggleExitIntent: () => void;
    widgetOpenBehavior: WidgetOpenBehavior;
    handleSetWidgetOpenBehavior: (behavior: WidgetOpenBehavior) => void;
    isAutoActivateEnabled: boolean;
    handleToggleAutoActivate: () => void;
    // Google Workspace Integration
    isGoogleConnected: boolean;
    handleConnectGoogle: () => void;
    handleDisconnectGoogle: () => void;
    // Webhook Integration
    webhooks: Webhook[];
    addWebhook: (webhook: NewWebhook) => Promise<Webhook>;
    deleteWebhook: (webhookId: string) => Promise<void>;
    testWebhook: (webhookId: string) => Promise<{ success: boolean; message: string; }>;
}

export const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { agentService, voiceService, memoryService, googleWorkspaceService, integrationService, emailService } = useService();
    const agentCustomerId = 'cust_remodel_456';
    
    // --- START: Agent & Widget Settings State ---
    const [knowledgeBase, setKnowledgeBase] = useState<string | null>(null);
    const [isGeneratingKb, setIsGeneratingKb] = useState(false);
    const [kbGenerationMessage, setKbGenerationMessage] = useState('');
    const [kbError, setKbError] = useState<string | null>(null);
    const [kbBusinessMatches, setKbBusinessMatches] = useState<any[]>([]);
    const [isSearchingBusinesses, setIsSearchingBusinesses] = useState(false);
    
    const [appPersona, setAppPersona] = useState<AppPersona>('sales_agent');
    const [contractorTrade, setContractorTrade] = useState<string>('General Contractor (GC)');
    const [activeSalesStyle, setActiveSalesStyle] = useState<string>(Config.SALES_STYLES[0].name);
    const [ppcVertical, setPpcVertical] = useState<string>(Config.PPC_VERTICALS[0]);
    
    const [ppcCustomVertical, setPpcCustomVertical] = useState('');
    const [ppcServices, setPpcServices] = useState('');
    const [ppcKeywords, setPpcKeywords] = useState('');
    const [customPpcInstructions, setCustomPpcInstructions] = useState('');
    const [isGeneratingPpcInstructions, setIsGeneratingPpcInstructions] = useState(false);
    const [ppcGeneratorStep, setPpcGeneratorStep] = useState<PpcGeneratorStep>('input');
    
    const [agentName, setAgentName] = useState('Elena');
    const [agentOpeningMessage, setAgentOpeningMessage] = useState('');
    const [additionalInstructions, setAdditionalInstructions] = useState('');
    const [agentVoice, setAgentVoice] = useState('Zephyr');
    const [agentAvatarUrl, setAgentAvatarUrl] = useState<string | null>(null);
    const [isGeneratingAgentAvatar, setIsGeneratingAgentAvatar] = useState(false);
    
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [widgetTitle, setWidgetTitle] = useState('Live Voice Agent');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [googleSheetUrl, setGoogleSheetUrl] = useState('');

    const [widgetPosition, setWidgetPosition] = useState<WidgetPosition>('top-left');
    const [widgetTheme, setWidgetTheme] = useState<WidgetTheme>('dark');
    const [customThemeColors, setCustomThemeColors] = useState<CustomThemeColors>({
        primary: '#1d4ed8', background: '#ffffff', text: '#334155', agentBubble: '#f1f5f9', userBubble: '#dbeafe',
    });
    
    const [isExitIntentEnabled, setIsExitIntentEnabled] = useState(true);
    const [widgetOpenBehavior, setWidgetOpenBehavior] = useState<WidgetOpenBehavior>('immediate');
    const [isAutoActivateEnabled, setIsAutoActivateEnabled] = useState(false);
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    // --- END: Agent & Widget Settings State ---

    // --- START: Application State ---
    const [appPhase, setAppPhase] = useState<AppPhase>('welcome');
    const [liveStatus, setLiveStatus] = useState<LiveStatus>('inactive');
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    const [currentUserText, setCurrentUserText] = useState('');
    const [currentModelText, setCurrentModelText] = useState('');
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isGeneratingRemodel, setIsGeneratingRemodel] = useState(false);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    const [isWidgetOpen, _setIsWidgetOpen] = useState(false);
    const [hasBeenManuallyClosed, setHasBeenManuallyClosed] = useState(false);
    const [hasManuallyEndedSession, setHasManuallyEndedSession] = useState(false);
    const [leadDetails, setLeadDetails] = useState<LeadDetails>({});
    const [isPendingSpaceCreation, setIsPendingSpaceCreation] = useState(false);
    const [diagnosis, setDiagnosis] = useState<string | null>(null);
    const [damageAnalysisReport, setDamageAnalysisReport] = useState<DamageAnalysisReport | null>(null);
    const [isTranscriptCollapsed, setIsTranscriptCollapsed] = useState(false);
    const [styleSuggestions, setStyleSuggestions] = useState<StyleSuggestion[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    // --- END: Application State ---

    // --- Refs ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const liveSessionRef = useRef<LiveSession | null>(null);
    
    // --- State Snapshot for Callbacks ---
    const stateRef = useRef({ spaces, activeSpaceId, selectedImageIndex, transcriptionHistory, leadDetails, diagnosis, damageAnalysisReport });
    useEffect(() => {
        stateRef.current = { spaces, activeSpaceId, selectedImageIndex, transcriptionHistory, leadDetails, diagnosis, damageAnalysisReport };
    }, [spaces, activeSpaceId, selectedImageIndex, transcriptionHistory, leadDetails, diagnosis, damageAnalysisReport]);

    // --- START: Settings Handlers ---
    const generateKnowledgeBase = useCallback(async (source: KbSource) => {
        setIsGeneratingKb(true); setKbError(null);
        try {
            const xml = await agentService.generateKnowledgeBase(source, setKbGenerationMessage);
            setKnowledgeBase(xml);
        } catch (e: any) { setKbError(e.message); } 
        finally { setIsGeneratingKb(false); }
    }, [agentService]);
    const searchBusinessesForKb = useCallback(async (name: string, loc: string) => {
        setIsSearchingBusinesses(true);
        try {
            const matches = await agentService.searchBusinesses(name, loc);
            setKbBusinessMatches(matches);
        } catch (e) { setKbError("Failed to search businesses."); }
        finally { setIsSearchingBusinesses(false); }
    }, [agentService]);
    const playVoiceSample = useCallback(async (voiceName: string) => {
        try {
            await voiceService.playTtsSample(voiceName);
        } catch (error) { console.error("Failed to play voice sample:", error); alert("Could not play voice sample."); }
    }, [voiceService]);
    const handleGenerateAgentAvatar = useCallback(async (style: string, subject: string, description: string) => {
        setIsGeneratingAgentAvatar(true);
        try {
            const url = await agentService.generateAgentAvatar(style, subject, description);
            setAgentAvatarUrl(url);
        } catch (error) { console.error("Error generating avatar:", error); alert("Failed to generate avatar."); }
        finally { setIsGeneratingAgentAvatar(false); }
    }, [agentService]);
    const handleSetLogo = useCallback(async (file: File) => setLogoUrl(await fileToBase64(file)), []);
    const handleConnectGoogle = useCallback(async () => {
        const success = await googleWorkspaceService.connect();
        setIsGoogleConnected(success);
    }, [googleWorkspaceService]);
    const handleDisconnectGoogle = useCallback(() => {
        googleWorkspaceService.disconnect();
        setIsGoogleConnected(false);
    }, [googleWorkspaceService]);
    const generateAndSetPpcInstructions = useCallback(async () => {
        if (!ppcCustomVertical.trim() || !ppcServices.trim()) {
            alert("Please provide a business vertical and services offered.");
            return;
        }
        setIsGeneratingPpcInstructions(true);
        try {
            const instructions = await agentService.generatePpcInstructions({
                vertical: ppcCustomVertical,
                services: ppcServices,
                keywords: ppcKeywords,
                phoneNumber: phoneNumber,
            });
            setCustomPpcInstructions(instructions);
            setPpcGeneratorStep('review');
        } catch (error) {
            console.error("Failed to generate PPC instructions:", error);
            alert("There was an error generating the instructions. Please try again.");
        } finally {
            setIsGeneratingPpcInstructions(false);
        }
    }, [agentService, ppcCustomVertical, ppcServices, ppcKeywords, phoneNumber]);


    // --- Webhook Handlers ---
    const fetchWebhooks = useCallback(async () => {
        setWebhooks(await integrationService.getWebhooks(agentCustomerId));
    }, [integrationService, agentCustomerId]);
    useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

    const addWebhook = useCallback(async (webhook: NewWebhook) => {
        const newWebhook = await integrationService.addWebhook(agentCustomerId, webhook);
        setWebhooks(prev => [...prev, newWebhook]);
        return newWebhook;
    }, [integrationService, agentCustomerId]);

    const deleteWebhook = useCallback(async (webhookId: string) => {
        await integrationService.deleteWebhook(agentCustomerId, webhookId);
        setWebhooks(prev => prev.filter(wh => wh.id !== webhookId));
    }, [integrationService, agentCustomerId]);

    const testWebhook = useCallback((webhookId: string) => {
        return integrationService.testWebhook(agentCustomerId, webhookId);
    }, [integrationService, agentCustomerId]);

    // --- END: Settings Handlers ---

    const getActiveSpace = useCallback(() => stateRef.current.spaces.find(s => s.id === stateRef.current.activeSpaceId) || null, []);
    
    const setIsWidgetOpen = useCallback((isOpen: boolean) => {
        _setIsWidgetOpen(isOpen);
        if (!isOpen) setHasBeenManuallyClosed(true);
    }, []);

    const endLiveConsultation = useCallback((leadDetailsOverride?: LeadDetails) => {
        // Capture state BEFORE it gets reset
        const transcript = stateRef.current.transcriptionHistory;
        const projectInfo: ProjectData = {
            spaces: (appPersona === 'remodeling_consultant' || appPersona === 'water_damage_restoration') ? stateRef.current.spaces : undefined,
            diagnosis: appPersona === 'contractor_agent' ? stateRef.current.diagnosis : undefined,
            damageAnalysisReport: appPersona === 'water_damage_restoration' ? stateRef.current.damageAnalysisReport : undefined,
        };
        const finalLeadDetails = leadDetailsOverride || stateRef.current.leadDetails;
    
        // --- Business Owner Reporting Logic ---
        // Fire-and-forget this process so UI cleanup doesn't wait
        if (transcript.length > 0) {
            (async () => {
                try {
                    // Generate the structured report data once.
                    const reportData = await agentService.generateReportData(
                        transcript,
                        appPersona,
                        finalLeadDetails,
                        projectInfo
                    );
                    
                    // Trigger 'lead_captured' webhook for every interaction that happened.
                    integrationService.triggerWebhookEvent(agentCustomerId, 'lead_captured', reportData);
    
                    // Send to Google Sheet if configured.
                    if (googleSheetUrl) {
                        const sheetId = googleSheetUrl.match(/\/d\/(.+?)\//)?.[1];
                        if (sheetId) {
                            await googleWorkspaceService.appendToGoogleSheet(sheetId, reportData);
                        } else {
                            console.warn("Invalid Google Sheet URL provided.");
                        }
                    }
                } catch (error) {
                    console.error("Failed to send business owner report:", error);
                }
            })();
        }
    
        // --- Session Cleanup Logic ---
        liveSessionRef.current?.close();
        liveSessionRef.current = null;
        setAppPhase('welcome');
        setLiveStatus('inactive');
        setTranscriptionHistory([]);
        setSpaces([]);
        setActiveSpaceId(null);
        setSelectedImageIndex(null);
        setLeadDetails({});
        setDiagnosis(null);
        setDamageAnalysisReport(null);
        setStyleSuggestions([]);
        setHasManuallyEndedSession(true);
    }, [agentService, googleWorkspaceService, integrationService, appPersona, agentCustomerId, googleSheetUrl]);

    const generateRemodel = useCallback(async (styleName: string, prompt: string, baseImage: DesignImage, refine: boolean): Promise<string> => {
        if (!stateRef.current.activeSpaceId) return "Error: No active space selected.";
        setIsGeneratingRemodel(true);
        try {
            const newImage = await voiceService.generateRemodelImage(styleName, prompt, baseImage, refine);
            setSpaces(prevSpaces => {
                const newSpaces = prevSpaces.map(space => {
                    if (space.id === stateRef.current.activeSpaceId) {
                        const newImages = [...space.images, newImage];
                        setSelectedImageIndex(newImages.length - 1);
                        return { ...space, images: newImages };
                    }
                    return space;
                });
                return newSpaces;
            });
            return `OK, I've created the ${styleName} design for you. Take a look.`;
        } catch (error: any) {
            console.error("Error generating remodel:", error);
            return "Sorry, I had trouble creating that design style.";
        } finally {
            setIsGeneratingRemodel(false);
        }
    }, [voiceService]);

    const generateStyleRemodel = useCallback(async (styleName: string, stylePrompt: string): Promise<string> => {
        const activeSpace = getActiveSpace();
        if (!activeSpace) return "Error: No active space selected.";
        const originalImage = activeSpace.images.find(img => img.style === 'Original');
        if (!originalImage) {
            return "Please add an image to the space first.";
        }
        return generateRemodel(styleName, stylePrompt, originalImage, false);
    }, [getActiveSpace, generateRemodel]);

    const generateWDRemodel = useCallback(async (styleName: string, prompt: string): Promise<string> => {
        const activeSpace = getActiveSpace();
        if (!activeSpace) return "Error: No active space selected.";

        const cleanedImage = activeSpace.images.find(img => img.style === 'Cleaned Slate');
        const report = stateRef.current.damageAnalysisReport;
        
        if (!cleanedImage || !report) {
            return "Error: Cannot generate remodel without a 'cleaned slate' image and a damage report.";
        }
        
        setIsGeneratingRemodel(true);
        try {
            const newImage = await voiceService.generateRemodelFromCleanedImage(cleanedImage, report, styleName, prompt);
             setSpaces(prevSpaces => {
                const newSpaces = prevSpaces.map(space => {
                    if (space.id === stateRef.current.activeSpaceId) {
                        const newImages = [...space.images, newImage];
                        setSelectedImageIndex(newImages.length - 1);
                        return { ...space, images: newImages };
                    }
                    return space;
                });
                return newSpaces;
            });
            return `OK, I've created the ${styleName} design for you. What do you think?`;
        } catch (error: any) {
            console.error("Error generating remodel from cleaned image:", error);
            return "Sorry, I had trouble creating that new design.";
        } finally {
            setIsGeneratingRemodel(false);
        }
    }, [voiceService, getActiveSpace]);
    
    const visualizeRepair = useCallback(async (prompt: string, baseImage: DesignImage): Promise<string> => {
        if (!stateRef.current.activeSpaceId) return "Error: No active space selected.";
        setIsGeneratingRemodel(true);
        try {
            const newImage = await voiceService.visualizeRepairImage(prompt, baseImage);
            setSpaces(prevSpaces => {
                return prevSpaces.map(space => {
                    if (space.id === stateRef.current.activeSpaceId) {
                        const newImages = [...space.images, newImage];
                        setSelectedImageIndex(newImages.length - 1);
                        return { ...space, images: newImages };
                    }
                    return space;
                });
            });
            return `OK, I've generated an image of that for you. What do you think?`;
        } catch (error: any) {
            console.error("Error visualizing repair:", error);
            return "Sorry, I had trouble creating that image.";
        } finally {
            setIsGeneratingRemodel(false);
        }
    }, [voiceService]);

    const refineRemodel = useCallback(async (prompt: string, baseImage: DesignImage): Promise<string> => {
        return generateRemodel(`Refined`, prompt, baseImage, true);
    }, [generateRemodel]);

    const toggleTranscriptCollapsed = useCallback(() => {
        setIsTranscriptCollapsed(prev => !prev);
    }, []);

    const startLiveConsultation = useCallback(async () => {
        if (liveStatus !== 'inactive') return;
        setHasManuallyEndedSession(false);
        setAppPhase('consultation');
        setLiveStatus('connecting');

        try {
            let systemInstruction: string;
            let tools: FunctionDeclaration[];

            switch (appPersona) {
                case 'remodeling_consultant':
                    systemInstruction = Config.REMODELING_SYSTEM_INSTRUCTION(agentName);
                    tools = Config.remodelingAgentTools;
                    break;
                case 'water_damage_restoration':
                    systemInstruction = Config.WATER_DAMAGE_SYSTEM_INSTRUCTION(agentName);
                    tools = Config.waterDamageAgentTools;
                    break;
                 case 'contractor_agent':
                    systemInstruction = Config.CONTRACTOR_AGENT_SYSTEM_INSTRUCTION(agentName, contractorTrade);
                    tools = Config.contractorAgentTools;
                    break;
                case 'sales_agent':
                    const selectedStyle = Config.SALES_STYLES.find(s => s.name === activeSalesStyle);
                    systemInstruction = Config.SALES_AGENT_SYSTEM_INSTRUCTION(agentName, selectedStyle?.prompt || Config.SALES_STYLES[0].prompt);
                    tools = Config.liveAgentTools;
                    break;
                case 'ppc_agent':
                    systemInstruction = Config.PPC_AGENT_SYSTEM_INSTRUCTION(agentName, ppcVertical);
                    tools = Config.liveAgentTools;
                    break;
                case 'customizable_ppc_agent':
                    if (!customPpcInstructions.trim()) {
                        alert("Please generate and save custom instructions for the PPC agent before starting a session.");
                        setLiveStatus('inactive');
                        setAppPhase('welcome');
                        return;
                    }
                    systemInstruction = customPpcInstructions;
                    tools = Config.customPpcAgentTools;
                    break;
                case 'live_voice_agent':
                default:
                    systemInstruction = Config.LIVE_AGENT_SYSTEM_INSTRUCTION(agentName);
                    tools = Config.liveAgentTools;
                    break;
            }

            let finalSystemInstruction = systemInstruction;

            if (agentOpeningMessage.trim()) {
                finalSystemInstruction = `**GREETING OVERRIDE (HIGHEST PRIORITY):** Your very first spoken words to the user MUST be this exact phrase: "${agentOpeningMessage.trim()}". Do not add any words before it. After delivering this greeting, continue with the rest of your instructions.\n\n---\n\n` + finalSystemInstruction;
            }

            if (additionalInstructions.trim()) {
                finalSystemInstruction += `\n\n**ADDITIONAL INSTRUCTIONS FROM BUSINESS OWNER:**\n${additionalInstructions.trim()}`;
            }

            const params: StartSessionParams = {
                videoElement: videoRef.current,
                systemInstruction: finalSystemInstruction,
                tools,
                agentVoice,
                appPersona,
                onStatusChanged: setLiveStatus,
                onTranscriptionUpdate: (user, model) => {
                    setCurrentUserText(user);
                    setCurrentModelText(model);
                },
                onTurnCompleted: (user, model) => {
                     setTranscriptionHistory(prev => [...prev, ...(user.trim() ? [{ speaker: 'user' as const, text: user.trim(), timestamp: '' }] : []), ...(model.trim() ? [{ speaker: 'model' as const, text: model.trim(), timestamp: '' }] : [])]);
                },
                onToolCall: async (fc) => {
                    let result = "I'm sorry, I wasn't able to do that.";
                    try {
                        const { name, args } = fc;
                        const activeSpace = getActiveSpace();
                        const originalImage = activeSpace?.images.find(img => img.style === 'Original');
                        const selectedImageIndex = stateRef.current.selectedImageIndex;
                        const currentImage = (selectedImageIndex !== null && activeSpace?.images[selectedImageIndex]) ? activeSpace.images[selectedImageIndex] : originalImage;
                        
                        switch (name) {
                            case 'remodelRoom': {
                                if (originalImage) result = await generateRemodel(args.styleName as string, args.prompt as string, originalImage, false);
                                else result = "Please capture a photo for this space first.";
                                break;
                            }
                            case 'remodelCleanedRoom': {
                                result = await generateWDRemodel(args.styleName as string, args.prompt as string);
                                break;
                            }
                            case 'refineRemodelDesign': {
                                if (currentImage) result = await refineRemodel(args.refinementPrompt as string, currentImage);
                                else result = "Please select a design to refine first.";
                                break;
                            }
                            case 'diagnoseProblemFromImage': {
                                if (originalImage) {
                                    const diagnosisText = await voiceService.diagnoseImage(originalImage.base64, originalImage.mimeType);
                                    setDiagnosis(diagnosisText);
                                    result = `(System: The diagnosis is complete. The result is: "${diagnosisText}". You must now discuss these findings with the user.)`;
                                } else {
                                    result = "I can't diagnose the problem without a photo. Please provide one first.";
                                }
                                break;
                            }
                            case 'visualizeRepair': {
                                if (currentImage) result = await visualizeRepair(args.prompt as string, currentImage);
                                else result = "Please provide a photo before I can visualize a repair.";
                                break;
                            }
                            case 'captureLeadDetails': {
                                const leadData = args as LeadDetails;
                                setLeadDetails(prev => ({ ...prev, ...leadData }));
                                integrationService.triggerWebhookEvent(agentCustomerId, 'lead_captured', { event_type: 'details_provided', ...leadData });
                                result = `Thank you, I've got that down.`;
                                break;
                            }
                            case 'sendDesignReport': {
                                setLeadDetails(prev => ({ ...prev, email: args.email as string }));
                                result = "Great, I've noted your email address. We'll send the report at the end of our session.";
                                break;
                            }
                            case 'createGoogleCalendarEvent': {
                                if (!isGoogleConnected) return "The user's Google account is not connected. Please ask them to connect it in the settings first.";
                                await googleWorkspaceService.createCalendarEvent(args as CalendarEvent);
                                integrationService.triggerWebhookEvent(agentCustomerId, 'consultation_scheduled', { event: args, leadDetails: stateRef.current.leadDetails });
                                result = `OK, I've scheduled the event "${args.title}" on the calendar.`;
                                break;
                            }
                            case 'switchToScanningMode': {
                                setAppPhase('consultation');
                                setIsPendingSpaceCreation(true);
                                result = "Okay, let's get ready to scan your next space. What would you like to call this room?";
                                break;
                            }
                            case 'setActiveSpace': {
                                const spaceName = (args.spaceName as string).toLowerCase();
                                const spaceToActivate = stateRef.current.spaces.find(s => s.name.toLowerCase() === spaceName);
                                if (spaceToActivate) {
                                    setActiveSpaceId(spaceToActivate.id);
                                    setAppPhase('design_studio');
                                    result = `Okay, we're now looking at the ${spaceToActivate.name}.`;
                                } else {
                                    result = `I couldn't find a space called "${args.spaceName}".`;
                                }
                                break;
                            }
                        }
                    } catch (e: any) { 
                        console.error(`Error executing tool call ${fc.name}:`, e);
                        result = e.message || "I encountered an error with that request.";
                    }
                    return result;
                },
                onClose: () => {
                    if (liveStatus !== 'inactive') {
                        endLiveConsultation();
                    }
                }
            };

            const session = await voiceService.startSession(params);
            liveSessionRef.current = session;
            
        } catch (error) {
            console.error('Failed to start session:', error);
            setLiveStatus('error');
            endLiveConsultation();
        }

    }, [liveStatus, appPersona, agentName, contractorTrade, activeSalesStyle, agentVoice, ppcVertical, agentOpeningMessage, additionalInstructions, voiceService, endLiveConsultation, generateRemodel, refineRemodel, getActiveSpace, isGoogleConnected, googleWorkspaceService, integrationService, agentCustomerId, visualizeRepair, generateWDRemodel, customPpcInstructions]);
    
    const openAndStartConsultation = useCallback(() => {
        setIsWidgetOpen(true);
        startLiveConsultation();
    }, [setIsWidgetOpen, startLiveConsultation]);

    const handleSendReportAndEnd = useCallback(async (email: string) => {
        try {
            const finalLeadDetails: LeadDetails = { ...stateRef.current.leadDetails, email };
            const projectData: ProjectData = {
                spaces: (appPersona === 'remodeling_consultant' || appPersona === 'water_damage_restoration') ? stateRef.current.spaces : undefined,
                diagnosis: appPersona === 'contractor_agent' ? stateRef.current.diagnosis : undefined,
                damageAnalysisReport: appPersona === 'water_damage_restoration' ? stateRef.current.damageAnalysisReport : undefined,
            };
    
            const reportData = await agentService.generateReportData(stateRef.current.transcriptionHistory, appPersona, finalLeadDetails, projectData);
            
            const htmlReport = await emailService.formatReportAsHtml(reportData, {
                logoUrl, widgetTitle, phoneNumber, primaryColor: customThemeColors.primary
            });
            
            await emailService.sendEmail(email, `Your ${widgetTitle} Session Summary`, htmlReport);

            integrationService.triggerWebhookEvent(agentCustomerId, 'report_sent', { email, ...reportData });
    
        } catch (error) {
            console.error("Error during user report generation and sending:", error);
        } finally {
            endLiveConsultation({ ...stateRef.current.leadDetails, email });
        }
    }, [agentService, emailService, appPersona, logoUrl, widgetTitle, phoneNumber, customThemeColors.primary, endLiveConsultation, agentCustomerId, integrationService]);
    
    // --- More Actions ---
    const addImageToActiveSpace = useCallback((image: DesignImage) => {
        if (image.style === 'Original') {
            setDiagnosis(null);
            setDamageAnalysisReport(null);
        }
        if (!activeSpaceId) {
            const newSpace: Space = { id: `space_${Date.now()}`, name: 'My First Space', images: [image] };
            setSpaces([newSpace]);
            setActiveSpaceId(newSpace.id);
            setSelectedImageIndex(0);
        } else {
            setSpaces(prevSpaces => {
                const newSpaces = prevSpaces.map(space => {
                    if (space.id === activeSpaceId) {
                        if (image.style === 'Original') {
                            const existingDesigns = space.images.filter(img => img.style !== 'Original');
                            const newImages = [image, ...existingDesigns];
                            return { ...space, images: newImages };
                        }
                        return { ...space, images: [...space.images, image] };
                    }
                    return space;
                });
                const activeSp = newSpaces.find(s => s.id === activeSpaceId);
                setSelectedImageIndex(activeSp ? activeSp.images.length -1 : 0);
                return newSpaces;
            });
        }
    }, [activeSpaceId]);

    const handlePhoto = useCallback(async (imagePromise: Promise<DesignImage>) => {
        setIsAnalyzingImage(true);
        try {
            const originalImage = await imagePromise;

            if (appPersona === 'water_damage_restoration') {
                liveSessionRef.current?.sendSystemMessage(`(System: The user has provided a photo. You must inform them the automated analysis and cleanup visualization process is starting and will take up to a minute.)`);
                const report = await voiceService.getDamageAnalysis(originalImage.base64, originalImage.mimeType);
                setDamageAnalysisReport(report);
                const cleanedImage = await voiceService.generateCleanedImage(originalImage, report);
                
                setSpaces(prevSpaces => {
                    const newSpace: Space = { id: `space_${Date.now()}`, name: 'My First Space', images: [originalImage, cleanedImage] };
                    setActiveSpaceId(newSpace.id);
                    setSelectedImageIndex(1);
                    return [newSpace];
                });

                liveSessionRef.current?.sendSystemMessage(`(System: The automated analysis and 'cleaned slate' visualization are complete. You must now inform the user and guide them into the remodeling phase.)`);
                
                setIsFetchingSuggestions(true);
                try {
                    const suggestions = await voiceService.getStyleSuggestions(report);
                    setStyleSuggestions(suggestions);
                } catch (e) {
                    console.error("Failed to get style suggestions:", e);
                    setStyleSuggestions([]);
                } finally {
                    setIsFetchingSuggestions(false);
                }
                setAppPhase('design_studio');

            } else if (appPersona === 'contractor_agent') {
                addImageToActiveSpace(originalImage);
                liveSessionRef.current?.sendSystemMessage(`(System: The user has provided a photo for troubleshooting. Advise the user you are analyzing the image and then immediately call the 'diagnoseProblemFromImage' tool to begin.)`);
                setAppPhase('design_studio');
            
            } else if (appPersona === 'remodeling_consultant') {
                addImageToActiveSpace(originalImage);
                const analysis = await voiceService.analyzeImage(originalImage.base64, originalImage.mimeType);
                liveSessionRef.current?.sendSystemMessage(`(System: The user has captured a photo for the '${getActiveSpace()?.name || 'current'}' space. Here is an analysis of the image: ${analysis})`);
                setAppPhase('design_studio');
            }
            
        } catch (e) { console.error(e); }
        finally { setIsAnalyzingImage(false); }
    }, [voiceService, addImageToActiveSpace, getActiveSpace, appPersona]);
    
    const takeAndSetStillPhoto = useCallback(async () => {
        if (!videoRef.current) return;
        handlePhoto(voiceService.capturePhotoFromVideo(videoRef.current));
    }, [voiceService, handlePhoto]);
    
    const uploadAndSetStillPhoto = useCallback(async (file: File) => {
        handlePhoto(voiceService.processUploadedPhoto(file));
    }, [voiceService, handlePhoto]);


    useEffect(() => {
        const handleMouseOut = (e: MouseEvent) => {
            if (isExitIntentEnabled && !isWidgetOpen && !hasBeenManuallyClosed && e.clientY <= 0) setIsWidgetOpen(true);
        };
        document.addEventListener('mouseout', handleMouseOut);
        return () => document.removeEventListener('mouseout', handleMouseOut);
    }, [isExitIntentEnabled, isWidgetOpen, hasBeenManuallyClosed, setIsWidgetOpen]);

    useEffect(() => {
        if (widgetOpenBehavior === 'manual' || isWidgetOpen || hasBeenManuallyClosed) return;
        let timer: number;
        if (widgetOpenBehavior === 'immediate') setIsWidgetOpen(true);
        else if (widgetOpenBehavior === 'delay_15s') timer = window.setTimeout(() => setIsWidgetOpen(true), 15000);
        else if (widgetOpenBehavior === 'delay_30s') timer = window.setTimeout(() => setIsWidgetOpen(true), 30000);
        return () => clearTimeout(timer);
    }, [widgetOpenBehavior, isWidgetOpen, hasBeenManuallyClosed, setIsWidgetOpen]);

    useEffect(() => {
        if (isWidgetOpen && isAutoActivateEnabled && liveStatus === 'inactive' && appPhase === 'welcome' && !hasManuallyEndedSession) {
            startLiveConsultation();
        }
    }, [isWidgetOpen, isAutoActivateEnabled, liveStatus, appPhase, startLiveConsultation, hasManuallyEndedSession]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files?.[0]) uploadAndSetStillPhoto(event.target.files[0]); };
    const handleUploadClick = () => fileInputRef.current?.click();
    const handleCreateNewSpace = (name: string) => {
        const newSpace: Space = { id: `space_${Date.now()}`, name, images: [] };
        setSpaces(prev => [...prev, newSpace]);
        setActiveSpaceId(newSpace.id);
        setIsPendingSpaceCreation(false);
        setAppPhase('consultation');
    };
    const handleSetAppPersona = (persona: AppPersona) => setAppPersona(persona);
    const handleSetContractorTrade = (trade: string) => setContractorTrade(trade);
    const handleSetActiveSalesStyle = (styleName: string) => setActiveSalesStyle(styleName);
    const handleSetPpcVertical = (vertical: string) => setPpcVertical(vertical);
    const handleSetPpcCustomVertical = (vertical: string) => setPpcCustomVertical(vertical);
    const handleSetPpcServices = (services: string) => setPpcServices(services);
    const handleSetPpcKeywords = (keywords: string) => setPpcKeywords(keywords);
    const handleSetCustomPpcInstructions = (instructions: string) => setCustomPpcInstructions(instructions);
    const handleSetPpcGeneratorStep = (step: PpcGeneratorStep) => setPpcGeneratorStep(step);
    const handleSetAgentName = (name: string) => setAgentName(name);
    const handleSetAgentOpeningMessage = (message: string) => setAgentOpeningMessage(message);
    const handleSetAdditionalInstructions = (instructions: string) => setAdditionalInstructions(instructions);
    const handleSetAgentVoice = (voice: string) => setAgentVoice(voice);
    const handleClearLogo = () => setLogoUrl(null);
    const handleSetWidgetTitle = (title: string) => setWidgetTitle(title);
    const handleSetPhoneNumber = (phone: string) => setPhoneNumber(phone);
    const handleSetGoogleSheetUrl = (url: string) => setGoogleSheetUrl(url);
    const handleSetWidgetPosition = (position: WidgetPosition) => setWidgetPosition(position);
    const handleSetWidgetTheme = (theme: WidgetTheme) => setWidgetTheme(theme);
    const handleSetCustomThemeColor = (colorType: keyof CustomThemeColors, value: string) => setCustomThemeColors(prev => ({ ...prev, [colorType]: value }));
    const handleToggleExitIntent = () => setIsExitIntentEnabled(prev => !prev);
    const handleSetWidgetOpenBehavior = (behavior: WidgetOpenBehavior) => setWidgetOpenBehavior(behavior);
    const handleToggleAutoActivate = () => setIsAutoActivateEnabled(prev => !prev);
    const clearKnowledgeBase = () => setKnowledgeBase(null);
    const clearBusinessMatches = () => setKbBusinessMatches([]);

    return (
        <WidgetContext.Provider value={{
            appPhase, liveStatus, transcriptionHistory, currentUserText, currentModelText, videoRef, spaces, activeSpaceId,
            selectedImageIndex, isGeneratingRemodel, isAnalyzingImage, isWidgetOpen, isPendingSpaceCreation, diagnosis, damageAnalysisReport,
            isTranscriptCollapsed, styleSuggestions, isFetchingSuggestions,
            startLiveConsultation, endLiveConsultation, openAndStartConsultation, takeAndSetStillPhoto, generateStyleRemodel,
            generateWDRemodel, handleSendReportAndEnd, setSelectedImageIndex, handleCreateNewSpace, setActiveSpaceId,
            handleUploadClick, handleFileChange, fileInputRef, setIsWidgetOpen, setIsPendingSpaceCreation, toggleTranscriptCollapsed,
            knowledgeBase, isGeneratingKb, kbGenerationMessage, kbError, generateKnowledgeBase, clearKnowledgeBase,
            kbBusinessMatches, isSearchingBusinesses, searchBusinessesForKb, clearBusinessMatches, agentCustomerId, appPersona, handleSetAppPersona,
            contractorTrade, handleSetContractorTrade, activeSalesStyle, handleSetActiveSalesStyle, ppcVertical, handleSetPpcVertical, 
            ppcCustomVertical, handleSetPpcCustomVertical, ppcServices, handleSetPpcServices, ppcKeywords, handleSetPpcKeywords,
            customPpcInstructions, handleSetCustomPpcInstructions, isGeneratingPpcInstructions, ppcGeneratorStep, handleSetPpcGeneratorStep,
            generateAndSetPpcInstructions,
            agentName, handleSetAgentName, agentOpeningMessage, handleSetAgentOpeningMessage, additionalInstructions, handleSetAdditionalInstructions,
            agentVoice, handleSetAgentVoice, playVoiceSample, agentAvatarUrl, isGeneratingAgentAvatar, 
            handleGenerateAgentAvatar, logoUrl, widgetTitle, phoneNumber, googleSheetUrl, handleSetLogo, handleClearLogo, 
            handleSetWidgetTitle, handleSetPhoneNumber, handleSetGoogleSheetUrl, widgetPosition, handleSetWidgetPosition, 
            widgetTheme, handleSetWidgetTheme, customThemeColors, handleSetCustomThemeColor, isExitIntentEnabled, 
            handleToggleExitIntent, widgetOpenBehavior, handleSetWidgetOpenBehavior, isAutoActivateEnabled, handleToggleAutoActivate, 
            isGoogleConnected, handleConnectGoogle, handleDisconnectGoogle, webhooks, addWebhook, deleteWebhook, testWebhook,
        }}>
            {children}
        </WidgetContext.Provider>
    );
};

export const useWidgetContext = () => {
    const context = useContext(WidgetContext);
    if (context === undefined) {
        throw new Error('useWidgetContext must be used within a WidgetProvider');
    }
    return context;
};