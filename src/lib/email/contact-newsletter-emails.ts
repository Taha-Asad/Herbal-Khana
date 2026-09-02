// lib/email/contact-newsletter-emails.ts
import path from "path";
import ejs from "ejs";
import { sendMail } from "../mailer";

// =============================================================================
// CONFIG
// =============================================================================

const config = {
  logoUrl: process.env.LOGO_URL || "https://your-domain.com/logo.png",
  websiteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com",
  adminUrl:
    process.env.NEXT_PUBLIC_APP_URL + "/admin/messages" ||
    "https://your-domain.com/admin/messages",
  shopUrl:
    process.env.NEXT_PUBLIC_APP_URL + "/shop" || "https://your-domain.com/shop",
  adminEmail: process.env.ADMIN_EMAIL || "admin@your-domain.com",
  socialLinks: {
    facebookUrl: process.env.FACEBOOK_URL,
    instagramUrl: process.env.INSTAGRAM_URL,
    twitterUrl: process.env.TWITTER_URL,
    whatsappUrl: process.env.WHATSAPP_URL,
  },
};

// =============================================================================
// SEND CONTACT NOTIFICATION TO ADMIN
// =============================================================================

interface ContactNotificationParams {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  timestamp?: Date;
}

export const sendContactNotificationEmail = async (
  params: ContactNotificationParams
): Promise<{ success: boolean; error?: string }> => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "contact-notification.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      ...params,
      timestamp: params.timestamp || new Date(),
      logoUrl: config.logoUrl,
      adminUrl: config.adminUrl,
    });

    // Send to admin email
    await sendMail(
      config.adminEmail,
      `📬 New Message: ${params.subject}`,
      htmlContent
    );

    return { success: true };
  } catch (error) {
    console.error("Error sending contact notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

// =============================================================================
// SEND NEWSLETTER WELCOME EMAIL TO SUBSCRIBER
// =============================================================================

interface NewsletterWelcomeParams {
  email: string;
  unsubscribeToken: string;
  discountCode?: string;
  discountPercent?: number;
}

export const sendNewsletterWelcomeEmail = async (
  params: NewsletterWelcomeParams
): Promise<{ success: boolean; error?: string }> => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "newsletter-welcome.ejs"
    );

    const unsubscribeUrl = `${config.websiteUrl}/unsubscribe/${params.unsubscribeToken}`;

    const htmlContent = await ejs.renderFile(templatePath, {
      email: params.email,
      discountCode: params.discountCode,
      discountPercent: params.discountPercent,
      unsubscribeUrl,
      logoUrl: config.logoUrl,
      websiteUrl: config.websiteUrl,
      shopUrl: config.shopUrl,
      ...config.socialLinks,
    });

    await sendMail(
      params.email,
      "Welcome to Herbal Khana Newsletter!",
      htmlContent
    );

    return { success: true };
  } catch (error) {
    console.error("Error sending newsletter welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

// =============================================================================
// SEND NEWSLETTER CONFIRMATION EMAIL (Double Opt-in)
// =============================================================================

interface NewsletterConfirmParams {
  email: string;
  confirmToken: string;
}

export const sendNewsletterConfirmEmail = async (
  params: NewsletterConfirmParams
): Promise<{ success: boolean; error?: string }> => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "newsletter-confirm.ejs"
    );

    const confirmUrl = `${config.websiteUrl}/newsletter/confirm/${params.confirmToken}`;

    const htmlContent = await ejs.renderFile(templatePath, {
      email: params.email,
      confirmUrl,
      logoUrl: config.logoUrl,
      websiteUrl: config.websiteUrl,
    });

    await sendMail(
      params.email,
      "Confirm Your Newsletter Subscription",
      htmlContent
    );

    return { success: true };
  } catch (error) {
    console.error("Error sending newsletter confirm email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

// =============================================================================
// SEND CONTACT AUTO-REPLY TO CUSTOMER
// =============================================================================

interface ContactAutoReplyParams {
  name: string;
  email: string;
  subject: string;
}

export const sendContactAutoReplyEmail = async (
  params: ContactAutoReplyParams
): Promise<{ success: boolean; error?: string }> => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "contact-auto-reply.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      name: params.name,
      subject: params.subject,
      logoUrl: config.logoUrl,
      websiteUrl: config.websiteUrl,
      shopUrl: config.shopUrl,
      ...config.socialLinks,
    });

    await sendMail(
      params.email,
      "We've Received Your Message! ✨",
      htmlContent
    );

    return { success: true };
  } catch (error) {
    console.error("Error sending contact auto-reply email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};
