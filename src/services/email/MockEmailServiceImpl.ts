// src/services/email/MockEmailServiceImpl.ts
import { GoogleGenAI } from '@google/genai';
import { EmailService, BrandingOptions } from './EmailService';

/**
 * @class MockEmailServiceImpl
 * @description A mock implementation of EmailService for prototyping. It uses Gemini
 * to generate HTML emails and logs sending actions to the console.
 * Bolt.new will replace this with a production implementation using a real email provider.
 */
export class MockEmailServiceImpl implements EmailService {
    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }

    async formatReportAsHtml(reportData: any, branding: BrandingOptions): Promise<string> {
        const reportJsonString = JSON.stringify(reportData, null, 2);

        const prompt = `
            You are an expert email designer specializing in creating beautiful, professional HTML reports for clients.
            Your task is to take the following JSON data and generate a single, self-contained, professional HTML file.

            **Design Requirements:**
            - Use inline CSS for maximum compatibility with all email clients (like Gmail, Outlook).
            - The design should be clean, modern, and easy to read, with good use of white space.
            - Use a one-column layout that is responsive and mobile-friendly.
            - The primary color for headers and buttons should be '${branding.primaryColor || '#1d4ed8'}'.

            **Branding Elements to Incorporate:**
            - Company Logo URL: ${branding.logoUrl || 'Not provided'}
            - Company Name / Title: ${branding.widgetTitle || 'Consultation Summary'}
            - Company Phone: ${branding.phoneNumber || 'Not provided'}

            **JSON Data to Format:**
            ---
            ${reportJsonString}
            ---

            **Structure of the HTML Report:**
            1.  **Header:** Display the company logo (if provided), otherwise just the Company Name.
            2.  **Main Title:** A clear title like "Your Consultation Summary".
            3.  **Lead Details:** A section with the customer's Name, Phone, and Email.
            4.  **Executive Summary:** Display the 'executiveSummary' from the JSON.
            5.  **Key Details Section:** Use subheadings for:
                -   Customer's Goal (from 'userIntent')
                -   Key Questions Asked (from 'keyQuestions')
                -   Agent's Assessment (from 'sentimentAnalysis')
            6.  **Project-Specific Data (if present):** If 'projectData' exists in the JSON, format it nicely. For example, if there is a 'diagnosis', display it. If there are 'spaces' for a remodel, list each space and its details.
            7.  **Next Steps:** Display the 'businessNextStep' as a clear call to action for the customer.
            8.  **Footer:** Include the Company Name and Phone Number.

            **Final Output:**
            Respond ONLY with the raw HTML code. Do not include any explanatory text, markdown formatting, or conversational filler.
        `;

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        // Clean up the response to ensure it's just HTML
        return response.text.replace(/^```html\s*/, '').replace(/```$/, '').trim();
    }

    async sendEmail(recipientEmail: string, subject: string, htmlContent: string): Promise<void> {
        console.log(`
            ==================================================
            [MockEmailService] SIMULATING EMAIL SEND
            --------------------------------------------------
            TO: ${recipientEmail}
            SUBJECT: ${subject}
            --------------------------------------------------
            BODY (HTML):
            ${htmlContent.substring(0, 500)}...
            (Full HTML content logged below for inspection)
            ==================================================
        `);
        console.log(htmlContent); // Log the full HTML for debugging/previewing
        return Promise.resolve();
    }
}
