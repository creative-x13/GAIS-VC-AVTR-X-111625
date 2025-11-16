// src/services/agent/MockAgentServiceImpl.ts
import { GoogleGenAI } from '@google/genai';
import { AgentService, KbSource } from './AgentService';
import { BusinessMatch, LeadDetails } from '../../types/agent';
import { ProjectData } from '../../types/project';
import { AppPersona, TranscriptionEntry } from '../../types/widget';
import * as Config from '../../config/remodelingLiveConfig';

const sanitizeXmlResponse = (text: string): string => text.replace(/^```xml\s*/, '').replace(/```$/, '').trim();
const sanitizeJsonResponse = (text: string): string => text.replace(/^```json\s*/, '').replace(/```$/, '').trim();

type ExtractionConfig = {
    tools?: ({ googleSearch: {} } | { googleMaps: {} })[];
};

/**
 * @class MockAgentServiceImpl
 * @description A mock implementation of AgentService for prototyping in Google AI Studio.
 * It uses the Gemini API directly to fulfill service requests.
 * Bolt.new will replace this with a production implementation that calls a secured backend.
 */
export class MockAgentServiceImpl implements AgentService {
  
  async generateKnowledgeBase(source: KbSource, onProgress: (message: string) => void): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    onProgress('Step 1/3: Extracting business information...');
    
    let extractionPrompt: string;
    let extractionConfig: ExtractionConfig = {};

    switch (source.type) {
      case 'url':
        extractionPrompt = `Extract all key information about the business from this URL: ${source.value}`;
        extractionConfig = { tools: [{ googleSearch: {} }] };
        break;
      case 'business':
        extractionPrompt = `Extract detailed information for the business "${source.value.name}" at address "${source.value.address}" (Place ID: ${source.value.placeId}). Focus on services, hours, contact info, and customer reviews.`;
        extractionConfig = { tools: [{ googleMaps: {} }] };
        break;
      case 'file':
        extractionPrompt = `You are a business data extraction specialist. Your task is to carefully read the following document and extract all key, structured information about the business. Focus on identifying: business name, services offered, products, operating hours, contact information (phone, address, email), mission statement, and frequently asked questions (FAQs). Present the extracted information in a clean, organized manner. Here is the document content:\n\n---\n\n${source.content}`;
        break;
    }

    const flashResponse = await ai.models.generateContent({
      model: Config.FAST_MODEL,
      contents: extractionPrompt,
      config: extractionConfig,
    });
    const rawText = flashResponse.text;
    if (!rawText) throw new Error("Initial data extraction failed. The model returned no text.");

    onProgress('Step 2/3: Synthesizing knowledge base...');
    const proMarkdownResponse = await ai.models.generateContent({
      model: Config.ADVANCED_MODEL,
      contents: `Synthesize this raw data into a structured markdown document for a business knowledge base. Include sections for Business Overview, Services, Products, Hours, Contact Info, and FAQs:\n\n${rawText}`
    });
    const markdownText = proMarkdownResponse.text;
    if (!markdownText) throw new Error("Knowledge base synthesis failed.");

    onProgress('Step 3/3: Formatting XML output...');
    const proXmlResponse = await ai.models.generateContent({
      model: Config.ADVANCED_MODEL,
      contents: `You are an expert in formatting knowledge bases for real-time virtual voice agents. Convert the following Markdown content into a structured XML format. The root element must be <knowledge_base>. Use hierarchical tags like <section title="...">, <topic name="...">, <faq>, <question>, and <answer>. Do not include any explanatory text or conversational filler. Respond only with the raw XML.\n\n${markdownText}`
    });
    const finalXml = sanitizeXmlResponse(proXmlResponse.text);
    if (!finalXml.startsWith('<knowledge_base>')) throw new Error("Final XML formatting failed. The model returned an invalid format.");
    
    return finalXml;
  }

  async searchBusinesses(businessName: string, location: string): Promise<BusinessMatch[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Find businesses matching "${businessName}" near "${location}". Respond ONLY with a valid JSON array of objects. Each object must have "name", "address", and "placeId" properties. Do not include any other text or markdown formatting.`;

    const response = await ai.models.generateContent({
        model: Config.FAST_MODEL,
        contents: prompt,
        config: { tools: [{ googleMaps: {} }] }
    });

    const sanitizedText = sanitizeJsonResponse(response.text);
    return JSON.parse(sanitizedText) as BusinessMatch[];
  }

  async generateAgentAvatar(style: string, subject: string, description: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `Professional corporate headshot, ${style} style, of a ${subject}, ${description}, clean studio background.`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1, aspectRatio: '1:1' }
    });

    if (!response.generatedImages?.[0]?.image?.imageBytes) {
      throw new Error("API did not return image data for avatar.");
    }
    
    return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
  }

  async generateReportData(transcript: TranscriptionEntry[], persona: AppPersona, leadDetails: LeadDetails, projectData: ProjectData): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const fullTranscriptText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');

    const personaDescription = {
        remodeling_consultant: "The agent was a virtual design consultant discussing a home remodel.",
        contractor_agent: "The agent was a virtual contractor assistant troubleshooting a home repair issue.",
        sales_agent: "The agent was a virtual sales agent discussing a product or service.",
        live_voice_agent: "The agent was a virtual customer support agent answering questions.",
        water_damage_restoration: "The agent was a virtual restoration specialist.",
        ppc_agent: "The agent was a virtual connection service assistant.",
        customizable_ppc_agent: "The agent was a custom-instructed Pay-Per-Call virtual assistant."
    }[persona];
    
    const prompt = `
      You are a "Summarizer Agent" that analyzes conversation transcripts between a virtual agent and a human user.
      Your task is to extract key information and structure it as a clean JSON object.
      Do not include any conversational text or markdown formatting in your response. Respond ONLY with the JSON object.

      **Conversation Context:**
      - The virtual agent's persona was: ${personaDescription}
      - The captured lead details are: Name: ${leadDetails.name || 'Not provided'}, Phone: ${leadDetails.phone || 'Not provided'}, Email: ${leadDetails.email || 'Not provided'}
      - Additional project data (if any): ${JSON.stringify(projectData)}

      **Full Conversation Transcript:**
      ---
      ${fullTranscriptText}
      ---

      **Your Tasks:**
      Based on the full transcript and context, perform the following actions:
      1.  **executiveSummary:** Write a concise, one-paragraph summary of the entire conversation.
      2.  **userIntent:** Clearly state the customer's primary goal or problem in one sentence.
      3.  **sentimentAnalysis:** Provide a brief note on the customer's perceived sentiment (e.g., "Eager and decisive," "Cautious and concerned about budget").
      4.  **keyQuestions:** List the 2-3 most important questions the customer asked.
      5.  **businessNextStep:** Recommend a clear, actionable next step for the business owner (e.g., "Follow up with a detailed quote within 24 hours.").

      **Output Format (Strictly JSON):**
      {
        "executiveSummary": "...",
        "userIntent": "...",
        "sentimentAnalysis": "...",
        "keyQuestions": ["...", "..."],
        "businessNextStep": "..."
      }
    `;

    const response = await ai.models.generateContent({
        model: Config.ADVANCED_MODEL,
        contents: prompt,
    });
    
    const sanitizedText = sanitizeJsonResponse(response.text);
    const parsedJson = JSON.parse(sanitizedText);
    
    // Combine AI analysis with existing data for a complete report object
    return {
        leadDetails,
        projectData,
        analysis: parsedJson,
        fullTranscript: fullTranscriptText
    };
  }

  async generatePpcInstructions(details: {
    vertical: string;
    services: string;
    keywords: string;
    phoneNumber: string;
  }): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const metaPrompt = `
      You are an expert in creating system instructions for AI virtual agents in Pay-Per-Call campaigns. Your task is to generate a system prompt that guides an AI agent to warm up customers and persuade them to click the call button.

      **Business Details:**
      - **Vertical:** ${details.vertical}
      - **Services:** ${details.services}
      - **Key Selling Points:** ${details.keywords}
      - **Target Phone Number:** ${details.phoneNumber}

      **Generated Prompt Requirements:**
      1.  **Primary Goal:** The agent's absolute top priority is to drive a call to the Target Phone Number.
      2.  **Persona:** The agent must be helpful, empathetic, and an expert in the specified vertical. It should build trust quickly.
      3.  **Flow:**
          a. Greet the user and understand their problem.
          b. Provide immediate value by referencing the services and selling points.
          c. Seamlessly transition to the call-to-action. Instruct the agent to say things like, "For the fastest help and an exact quote, your best bet is to speak directly with our specialists. Just click the phone number at the top of the widget to connect instantly."
      4.  **Tool Usage:** Explicitly forbid the agent from using the \`captureLeadDetails\` tool. The goal is an immediate call, not a callback.

      **Output:** A single block of text containing the complete system instructions for the new agent.
    `;
    
    const response = await ai.models.generateContent({
      model: Config.FAST_MODEL,
      contents: metaPrompt,
    });
    
    return response.text;
  }
}