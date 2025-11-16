// src/lib/contexts/ServiceContext.tsx
import React, { createContext, ReactNode } from 'react';
import { AgentService } from '../../services/agent/AgentService';
import { MockAgentServiceImpl } from '../../services/agent/MockAgentServiceImpl';
import { CreditService } from '../../services/credit/CreditService';
import { MockCreditServiceImpl } from '../../services/credit/MockCreditServiceImpl';
import { MemoryService } from '../../services/memory/MemoryService';
import { MockMemoryServiceImpl } from '../../services/memory/MockMemoryServiceImpl';
import { VoiceService } from '../../services/voice/VoiceService';
import { MockVoiceServiceImpl } from '../../services/voice/MockVoiceServiceImpl';
import { GoogleWorkspaceService } from '../../services/google/GoogleWorkspaceService';
import { MockGoogleWorkspaceServiceImpl } from '../../services/google/MockGoogleWorkspaceServiceImpl';
import { IntegrationService } from '../../services/integration/IntegrationService';
import { MockIntegrationServiceImpl } from '../../services/integration/MockIntegrationServiceImpl';
import { EmailService } from '../../services/email/EmailService';
import { MockEmailServiceImpl } from '../../services/email/MockEmailServiceImpl';

/**
 * @interface ServiceContainer
 * @description Defines the container for all abstract services used in the application.
 * This allows for dependency injection, making it easy to swap mock services
 * for real implementations in a production environment (e.g., in Bolt.new).
 */
export interface ServiceContainer {
  agentService: AgentService;
  creditService: CreditService;
  memoryService: MemoryService;
  voiceService: VoiceService;
  googleWorkspaceService: GoogleWorkspaceService;
  integrationService: IntegrationService;
  emailService: EmailService;
}

const ServiceContext = createContext<ServiceContainer | undefined>(undefined);

/**
 * @description Provides the service container to the entire application.
 * For prototyping in Google AI Studio, this provider instantiates the MOCK
 * implementations of the services. In a production environment, this is where
 * the real service implementations would be instantiated.
 */
export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const services: ServiceContainer = {
    agentService: new MockAgentServiceImpl(),
    creditService: new MockCreditServiceImpl(),
    memoryService: new MockMemoryServiceImpl(),
    voiceService: new MockVoiceServiceImpl(),
    googleWorkspaceService: new MockGoogleWorkspaceServiceImpl(),
    integrationService: new MockIntegrationServiceImpl(),
    emailService: new MockEmailServiceImpl(),
  };

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * @hook useService
 * @description A custom hook to easily access the service container from any component.
 * This is the primary way components should interact with backend logic.
 * @returns {ServiceContainer} The container with all application services.
 */
export const useServiceContext = () => {
  const context = React.useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServiceContext must be used within a ServiceProvider');
  }
  return context;
};