// app/action/contact.actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

// =============================================================================
// TYPES
// =============================================================================

interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ActionResult {
  success: boolean;
  message: string;
  errors?: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
}

// app/action/contact.actions.ts - Update submitContactForm function

import {
  sendContactNotificationEmail,
  sendContactAutoReplyEmail,
} from "@/lib/email/contact-newsletter-emails";
import { Prisma } from "@prisma/client";

// =============================================================================
// VALIDATION SCHEMA
// =============================================================================

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be less than 5000 characters"),
});

// =============================================================================
// RATE LIMITING (Simple in-memory)
// =============================================================================

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5; // 5 requests per hour per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// =============================================================================
// SUBMIT CONTACT FORM
// =============================================================================

export async function submitContactForm(
  input: ContactFormInput
): Promise<ActionResult> {
  try {
    // Get IP and user agent for tracking
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || undefined;

    // Check rate limit
    if (!checkRateLimit(ipAddress)) {
      return {
        success: false,
        message: "Too many requests. Please try again later.",
      };
    }

    // Validate input
    const validationResult = contactSchema.safeParse(input);

    if (!validationResult.success) {
      const errors: ActionResult["errors"] = {};
      validationResult.error.issues.forEach((error) => {
        const field = error.path[0] as keyof ContactFormInput;
        errors[field] = error.message;
      });

      return {
        success: false,
        message: "Please fix the errors below",
        errors,
      };
    }

    const { name, email, subject, message } = validationResult.data;

    // Check for spam patterns
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|winner|claim|prize)\b/i,
      /\b(click here|buy now|limited time|act now)\b/i,
      /(https?:\/\/[^\s]+){3,}/i, // Multiple URLs
    ];

    const combinedText = `${name} ${subject} ${message}`;
    const isSpam = spamPatterns.some((pattern) => pattern.test(combinedText));

    if (isSpam) {
      // Silently accept but don't save (honeypot-like behavior)
      return {
        success: true,
        message: "Thank you for your message. We'll get back to you soon!",
      };
    }

    // Save to database
    await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
        ipAddress,
        userAgent,
        status: "NEW",
      },
    });
    await sendContactNotificationEmail({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress,
      timestamp: new Date(),
    });

    // Send auto-reply to customer
    await sendContactAutoReplyEmail({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
    });

    // Optionally send notification email to admin
    // await sendAdminNotificationEmail({ name, email, subject, message });

    revalidatePath("/admin/messages");

    return {
      success: true,
      message:
        "Thank you for your message! We'll get back to you within 24-48 hours.",
    };
  } catch (error) {
    console.error("submitContactForm error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}

// =============================================================================
// ADMIN: GET CONTACT MESSAGES
// =============================================================================

interface GetMessagesFilters {
  status?: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  search?: string;
  page?: number;
  limit?: number;
}

interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  repliedAt?: string;
}

export async function getContactMessages(
  filters: GetMessagesFilters = {}
): Promise<{
  success: boolean;
  data?: {
    messages: ContactMessageItem[];
    total: number;
    pages: number;
  };
  error?: string;
}> {
  try {
    const { status, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ContactMessageWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return {
      success: true,
      data: {
        messages: messages.map((msg) => ({
          id: msg.id,
          name: msg.name,
          email: msg.email,
          subject: msg.subject,
          message: msg.message,
          status: msg.status,
          createdAt: msg.createdAt.toISOString(),
          repliedAt: msg.repliedAt?.toISOString(),
        })),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getContactMessages error:", error);
    return { success: false, error: "Failed to load messages" };
  }
}

// =============================================================================
// ADMIN: UPDATE MESSAGE STATUS
// =============================================================================

export async function updateMessageStatus(
  messageId: string,
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED"
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status },
    });

    revalidatePath("/admin/messages");

    return { success: true, message: "Status updated" };
  } catch (error) {
    console.error("updateMessageStatus error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

// =============================================================================
// ADMIN: GET UNREAD COUNT
// =============================================================================

export async function getUnreadMessageCount(): Promise<number> {
  try {
    return await prisma.contactMessage.count({
      where: { status: "NEW" },
    });
  } catch {
    return 0;
  }
}
