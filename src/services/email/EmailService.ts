// src/services/email/EmailService.ts

export interface BrandingOptions {
    logoUrl?: string | null;
    widgetTitle?: string;
    phoneNumber?: string;
    primaryColor?: string;
}

/**
 * @interface EmailService
 * @description Defines the abstract contract for email-related operations.
 * Bolt.new will implement this service using a real email provider like SendGrid.
 */
export interface EmailService {
    /**
     * Formats structured report data into a professional HTML email.
     * @param reportData The structured data object from the AgentService.
     * @param branding The branding options for the email header/footer.
     * @returns A promise that resolves to a string of HTML content.
     */
    formatReportAsHtml(reportData: any, branding: BrandingOptions): Promise<string>;

    /**
     * Sends an email to a recipient.
     * @param recipientEmail The email address of the recipient.
     * @param subject The subject line of the email.
     * @param htmlContent The HTML body of the email.
     * @returns A promise that resolves when the email is successfully sent.
     */
    sendEmail(recipientEmail: string, subject: string, htmlContent: string): Promise<void>;
}
