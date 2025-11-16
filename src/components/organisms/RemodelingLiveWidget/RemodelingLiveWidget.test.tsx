import React from 'react';
// These testing library imports are for demonstration purposes.
// In a real project with a test runner like Jest or Vitest, these would be installed
// and configured to allow for automated component testing.
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom'; // Provides custom matchers like .toBeInTheDocument()
import { describe, it, expect, jest } from '@jest/globals';

import { RemodelingLiveWidget } from './RemodelingLiveWidget';
import { WidgetContext, WidgetContextType } from '../../../contexts/WidgetContext';
import { AppPersona } from '../../../types/widget';
import { NewWebhook, Webhook } from '../../../types/integration';
import { KbSource } from '../../../services/agent/AgentService';

/**
 * Creates a comprehensive mock value for the WidgetContext.
 * This is necessary to render the RemodelingLiveWidget in a test environment,
 * as it depends on this context for its state and actions.
 * @param {object} overrides - Specific properties to override for a given test.
 * @returns A complete mock context object.
 */
const createMockContextValue = (overrides: Partial<WidgetContextType> = {}): WidgetContextType => {
  const defaults: WidgetContextType = {
  // Default states
  appPhase: 'welcome',
  liveStatus: 'inactive',
  transcriptionHistory: [],
  currentUserText: '',
  currentModelText: '',
  videoRef: { current: null },
  spaces: [],
  activeSpaceId: null,
  selectedImageIndex: null,
  isGeneratingRemodel: false,
  isAnalyzingImage: false,
  isWidgetOpen: true, // Widget must be open to test its content
  isPendingSpaceCreation: false,
  diagnosis: null,
  damageAnalysisReport: null,
  isTranscriptCollapsed: false,
  styleSuggestions: [],
  isFetchingSuggestions: false,
  
  // Default actions (mocked)
  toggleTranscriptCollapsed: jest.fn(),
  startLiveConsultation: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  endLiveConsultation: jest.fn(),
  openAndStartConsultation: jest.fn(),
  takeAndSetStillPhoto: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  generateStyleRemodel: jest.fn<(styleName: string, stylePrompt: string) => Promise<string>>().mockResolvedValue(''),
  generateWDRemodel: jest.fn<(styleName: string, stylePrompt: string) => Promise<string>>().mockResolvedValue(''),
  handleSendReportAndEnd: jest.fn<(email: string) => Promise<void>>().mockResolvedValue(undefined),
  setSelectedImageIndex: jest.fn(),
  handleCreateNewSpace: jest.fn(),
  setActiveSpaceId: jest.fn(),
  handleUploadClick: jest.fn(),
  handleFileChange: jest.fn(),
  fileInputRef: { current: null },
  setIsWidgetOpen: jest.fn(),
  setIsPendingSpaceCreation: jest.fn(),

  // Default settings
  knowledgeBase: null,
  isGeneratingKb: false,
  kbGenerationMessage: '',
  kbError: null,
  generateKnowledgeBase: jest.fn<(source: KbSource) => Promise<void>>().mockResolvedValue(undefined),
  clearKnowledgeBase: jest.fn(),
  kbBusinessMatches: [],
  isSearchingBusinesses: false,
  searchBusinessesForKb: jest.fn<(name: string, loc: string) => Promise<void>>().mockResolvedValue(undefined),
  clearBusinessMatches: jest.fn(),
  agentCustomerId: 'test_customer',
  appPersona: 'live_voice_agent',
  handleSetAppPersona: jest.fn(),
  contractorTrade: 'General Contractor (GC)',
  handleSetContractorTrade: jest.fn(),
  activeSalesStyle: '',
  handleSetActiveSalesStyle: jest.fn(),
  ppcVertical: 'Airline Ticket Calls',
  handleSetPpcVertical: jest.fn(),
  ppcCustomVertical: '',
  handleSetPpcCustomVertical: jest.fn(),
  ppcServices: '',
  handleSetPpcServices: jest.fn(),
  ppcKeywords: '',
  handleSetPpcKeywords: jest.fn(),
  customPpcInstructions: '',
  handleSetCustomPpcInstructions: jest.fn(),
  isGeneratingPpcInstructions: false,
  ppcGeneratorStep: 'input',
  handleSetPpcGeneratorStep: jest.fn(),
  generateAndSetPpcInstructions: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
  agentName: 'Elena',
  handleSetAgentName: jest.fn(),
  agentOpeningMessage: '',
  handleSetAgentOpeningMessage: jest.fn(),
  additionalInstructions: '',
  handleSetAdditionalInstructions: jest.fn(),
  agentVoice: 'Zephyr',
  handleSetAgentVoice: jest.fn(),
  playVoiceSample: jest.fn<(voiceName: string) => Promise<void>>().mockResolvedValue(undefined),
  agentAvatarUrl: null,
  isGeneratingAgentAvatar: false,
  handleGenerateAgentAvatar: jest.fn<(style: string, subject: string, description: string) => Promise<void>>().mockResolvedValue(undefined),
  logoUrl: null,
  widgetTitle: 'Live Agent',
  phoneNumber: '',
  googleSheetUrl: '',
  handleSetLogo: jest.fn<(file: File) => Promise<void>>().mockResolvedValue(undefined),
  handleClearLogo: jest.fn(),
  handleSetWidgetTitle: jest.fn(),
  handleSetPhoneNumber: jest.fn(),
  handleSetGoogleSheetUrl: jest.fn(),
  widgetPosition: 'bottom-right',
  handleSetWidgetPosition: jest.fn(),
  widgetTheme: 'dark',
  handleSetWidgetTheme: jest.fn(),
  customThemeColors: { primary: '#1d4ed8', background: '#ffffff', text: '#334155', agentBubble: '#f1f5f9', userBubble: '#dbeafe' },
  handleSetCustomThemeColor: jest.fn(),
  isExitIntentEnabled: false,
  handleToggleExitIntent: jest.fn(),
  widgetOpenBehavior: 'manual',
  handleSetWidgetOpenBehavior: jest.fn(),
  isAutoActivateEnabled: false,
  handleToggleAutoActivate: jest.fn(),
  isGoogleConnected: false,
  handleConnectGoogle: jest.fn(),
  handleDisconnectGoogle: jest.fn(),
  webhooks: [],
  addWebhook: jest.fn<(webhook: NewWebhook) => Promise<Webhook>>().mockResolvedValue({ id: 'wh_123', url: 'https://test.com', events: ['lead_captured'], signingSecret: 'secret', createdAt: new Date().toISOString() } as Webhook),
  deleteWebhook: jest.fn<(webhookId: string) => Promise<void>>().mockResolvedValue(undefined),
  testWebhook: jest.fn<(webhookId: string) => Promise<{ success: boolean; message: string; }>>().mockResolvedValue({ success: true, message: 'Test OK' }),
  };
  
  // Apply specific overrides for the current test
  return { ...defaults, ...overrides };
};

/**
 * Renders a component wrapped in a mock WidgetContext.Provider.
 * @param {object} overrides - Context properties to set for this specific render.
 */
const renderComponent = (overrides?: Partial<WidgetContextType>) => {
    const mockContext = createMockContextValue(overrides);
    return render(
        <WidgetContext.Provider value={mockContext}>
            <RemodelingLiveWidget />
        </WidgetContext.Provider>
    );
};

// --- Test Suite ---

describe('RemodelingLiveWidget: Avatar Display Feature', () => {

    const personas: AppPersona[] = ['live_voice_agent', 'sales_agent', 'remodeling_consultant', 'contractor_agent', 'water_damage_restoration', 'ppc_agent'];
    const avatarTestUrl = 'https://example.com/avatar.jpg';

    // Test that the avatar displays correctly for ALL personas
    personas.forEach(persona => {
        it(`should display the avatar on the welcome screen for the ${persona} persona when an avatar URL is provided`, () => {
            renderComponent({ appPersona: persona, agentAvatarUrl: avatarTestUrl, appPhase: 'welcome' });

            const avatarImage = screen.getByAltText('Agent Avatar');
            
            // Assertions: The image should exist and have the correct source URL
            expect(avatarImage).toBeInTheDocument();
            expect(avatarImage).toHaveAttribute('src', avatarTestUrl);
        });

        it(`should NOT display an avatar for the ${persona} persona if agentAvatarUrl is null`, () => {
            renderComponent({ appPersona: persona, agentAvatarUrl: null, appPhase: 'welcome' });
            
            // We use queryBy... because it returns null instead of throwing an error if not found
            const avatarImage = screen.queryByAltText('Agent Avatar');

            // Assertion: The image should not be in the document
            expect(avatarImage).not.toBeInTheDocument();
        });
    });

    it('should NOT display the welcome screen avatar if the app is not in the "welcome" phase', () => {
        renderComponent({ 
            appPersona: 'live_voice_agent', 
            agentAvatarUrl: avatarTestUrl,
            appPhase: 'consultation' // Key condition: not the welcome phase
        });

        // The specific welcome screen avatar (identified by its alt text) should not be present
        // during the live consultation.
        const welcomeAvatarImage = screen.queryByAltText('Agent Avatar');
        expect(welcomeAvatarImage).not.toBeInTheDocument();
    });
});


describe('RemodelingLiveWidget: Persona UI Rendering (Regression Safety Net)', () => {
    
    // Test case for the Remodeling Consultant
    it('should display the Design Studio for the remodeling_consultant persona', () => {
        renderComponent({ appPersona: 'remodeling_consultant', appPhase: 'design_studio' });
        expect(screen.getByText(/Design Studio/i)).toBeInTheDocument();
    });

    // Test case for the Contractor Agent
    it('should display the Troubleshooting Studio for the contractor_agent persona', () => {
        renderComponent({ appPersona: 'contractor_agent', appPhase: 'consultation' });
        expect(screen.getByText(/Troubleshooting Studio/i)).toBeInTheDocument();
    });
    
    // Test case for the new Water Damage Restoration persona
    it('should display the Water Damage Studio for the water_damage_restoration persona', () => {
        renderComponent({ appPersona: 'water_damage_restoration', appPhase: 'design_studio' });
        expect(screen.getByText(/Water Damage Studio/i)).toBeInTheDocument();
    });

    // Test cases for voice-only agents
    ['live_voice_agent', 'sales_agent', 'ppc_agent'].forEach(persona => {
        it(`should NOT display any visual studio for the ${persona} persona`, () => {
            renderComponent({ appPersona: persona as AppPersona, appPhase: 'consultation' });
            expect(screen.queryByText(/Design Studio/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Troubleshooting Studio/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Water Damage Studio/i)).not.toBeInTheDocument();
        });
    });
});

describe('RemodelingLiveWidget: Collapsible Transcript (Regression Safety Net)', () => {
    const personas: AppPersona[] = ['live_voice_agent', 'sales_agent', 'remodeling_consultant', 'contractor_agent', 'water_damage_restoration', 'ppc_agent'];

    personas.forEach(persona => {
        it(`should display the transcript content by default for the ${persona} persona during a session`, () => {
            renderComponent({ appPersona: persona, appPhase: 'consultation' });
            
            // The main content area of the transcript should be visible
            expect(screen.getByTestId('transcription-content')).toBeVisible();
        });
    });
});

describe('RemodelingLiveWidget: Collapsible Transcript Functionality', () => {
    it('should toggle the visibility of the transcript content when the collapse/expand button is clicked', () => {
        // This test simulates the context state changing, as if the user clicked the button.
        const { rerender } = renderComponent({ 
            appPersona: 'live_voice_agent', 
            appPhase: 'consultation', 
            isTranscriptCollapsed: false 
        });

        // 1. Initial State: Transcript is visible
        expect(screen.getByTestId('transcription-content')).toBeVisible();
        expect(screen.getByTestId('toggle-transcript-button')).toBeInTheDocument();

        // 2. Rerender with collapsed state = true
        rerender(
            <WidgetContext.Provider value={createMockContextValue({ appPersona: 'live_voice_agent', appPhase: 'consultation', isTranscriptCollapsed: true })}>
                <RemodelingLiveWidget />
            </WidgetContext.Provider>
        );
        
        // 3. Collapsed State: Transcript content is gone
        expect(screen.queryByTestId('transcription-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('toggle-transcript-button')).toBeInTheDocument(); // Button remains

        // 4. Rerender with collapsed state = false (to simulate expanding)
        rerender(
            <WidgetContext.Provider value={createMockContextValue({ appPersona: 'live_voice_agent', appPhase: 'consultation', isTranscriptCollapsed: false })}>
                <RemodelingLiveWidget />
            </WidgetContext.Provider>
        );

        // 5. Expanded State: Transcript content is back
        expect(screen.getByTestId('transcription-content')).toBeVisible();
    });
});