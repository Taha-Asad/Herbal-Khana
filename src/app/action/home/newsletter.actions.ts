"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

interface SubscribeResult {
  success: boolean;
  message: string;
  alreadySubscribed?: boolean;
}

interface GetSubscribersFilters {
  status?: "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";
  search?: string;
  page?: number;
  limit?: number;
}

interface SubscriberItem {
  id: string;
  email: string;
  status: "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";
  source?: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  emailsSent: number;
  emailsOpened: number;
}

// =============================================================================
// VALIDATION
// =============================================================================

const emailSchema = z.string().email("Please enter a valid email address");

// =============================================================================
// RATE LIMITING
// =============================================================================

const subscribeRateLimitMap = new Map<
  string,
  { count: number; lastReset: number }
>();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const MAX_SUBSCRIBE_ATTEMPTS = 10;

function checkSubscribeRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = subscribeRateLimitMap.get(ip);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    subscribeRateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= MAX_SUBSCRIBE_ATTEMPTS) return false;

  record.count++;
  return true;
}

// =============================================================================
// SUBSCRIBE
// =============================================================================
// app/action/newsletter.actions.ts - Update subscribeToNewsletter function

import { sendNewsletterWelcomeEmail } from "@/lib/email/contact-newsletter-emails";

export async function subscribeToNewsletter(
  email: string,
  source: string = "website"
): Promise<SubscribeResult> {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ??
      headersList.get("x-real-ip") ??
      "unknown";

    if (!checkSubscribeRateLimit(ipAddress)) {
      return {
        success: false,
        message: "Too many attempts. Please try again later.",
      };
    }

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      return {
        success: false,
        message: "Please enter a valid email address",
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.status === "ACTIVE") {
        return {
          success: true,
          message: "You're already subscribed to our newsletter!",
          alreadySubscribed: true,
        };
      }

      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          subscribedAt: new Date(),
          unsubscribedAt: null,
          source,
        },
      });

      return {
        success: true,
        message: "Welcome back! You've been resubscribed.",
      };
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        status: "ACTIVE",
        source,
        ipAddress,
      },
    });

    // Send welcome email with discount code
    await sendNewsletterWelcomeEmail({
      email: normalizedEmail,
      unsubscribeToken: subscriber.unsubscribeToken,
      discountCode: "WELCOME10", // You can generate dynamic codes
      discountPercent: 10,
    });

    return {
      success: true,
      message:
        "Thank you for subscribing! Check your inbox for a welcome email with a special discount.",
    };
  } catch (error) {
    console.error("subscribeToNewsletter error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: true,
        message: "You're already subscribed!",
        alreadySubscribed: true,
      };
    }

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}

// =============================================================================
// UNSUBSCRIBE
// =============================================================================

export async function unsubscribeFromNewsletter(
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return { success: false, message: "Invalid unsubscribe link." };
    }

    if (subscriber.status === "UNSUBSCRIBED") {
      return { success: true, message: "Already unsubscribed." };
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "You have been unsubscribed.",
    };
  } catch (error) {
    console.error("unsubscribeFromNewsletter error:", error);
    return { success: false, message: "Something went wrong." };
  }
}

// =============================================================================
// ADMIN: GET SUBSCRIBERS
// =============================================================================

export async function getNewsletterSubscribers(
  filters: GetSubscribersFilters = {}
): Promise<{
  success: boolean;
  data?: {
    subscribers: SubscriberItem[];
    total: number;
    pages: number;
    stats: {
      active: number;
      unsubscribed: number;
      total: number;
    };
  };
  error?: string;
}> {
  try {
    const { status, search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.NewsletterSubscriberWhereInput = {};

    if (status) where.status = status;
    if (search) {
      where.email = { contains: search, mode: "insensitive" };
    }

    const [subs, total, active, unsubscribed] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { subscribedAt: "desc" },
      }),
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
      prisma.newsletterSubscriber.count({ where: { status: "UNSUBSCRIBED" } }),
    ]);

    return {
      success: true,
      data: {
        subscribers: subs.map((s) => ({
          id: s.id,
          email: s.email,
          status: s.status,
          source: s.source ?? undefined,
          subscribedAt: s.subscribedAt.toISOString(),
          unsubscribedAt: s.unsubscribedAt?.toISOString(),
          emailsSent: s.emailsSent,
          emailsOpened: s.emailsOpened,
        })),
        total,
        pages: Math.ceil(total / limit),
        stats: {
          active,
          unsubscribed,
          total: active + unsubscribed,
        },
      },
    };
  } catch (error) {
    console.error("getNewsletterSubscribers error:", error);
    return { success: false, error: "Failed to load subscribers" };
  }
}
