// app/action/admin/newsletter.actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { Prisma } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

type SubscriptionStatus = "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";

interface GetSubscribersFilters {
  status?: SubscriptionStatus;
  search?: string;
  page?: number;
  limit?: number;
}

interface SubscriberItem {
  id: string;
  email: string;
  status: SubscriptionStatus;
  source?: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  emailsSent: number;
  emailsOpened: number;
}

interface SubscriberStats {
  total: number;
  active: number;
  unsubscribed: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
}

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

// =============================================================================
// GET SUBSCRIBERS
// =============================================================================

export async function getNewsletterSubscribers(
  filters: GetSubscribersFilters = {}
): Promise<{
  success: boolean;
  data?: {
    subscribers: SubscriberItem[];
    total: number;
    pages: number;
  };
  error?: string;
}> {
  try {
    await requireAdmin();

    const { status, search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.NewsletterSubscriberWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.email = { contains: search, mode: "insensitive" };
    }

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { subscribedAt: "desc" },
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    return {
      success: true,
      data: {
        subscribers: subscribers.map((sub) => ({
          id: sub.id,
          email: sub.email,
          status: sub.status as SubscriptionStatus,
          source: sub.source || undefined,
          subscribedAt: sub.subscribedAt.toISOString(),
          unsubscribedAt: sub.unsubscribedAt?.toISOString(),
          emailsSent: sub.emailsSent,
          emailsOpened: sub.emailsOpened,
        })),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getNewsletterSubscribers error:", error);
    return { success: false, error: "Failed to load subscribers" };
  }
}

// =============================================================================
// GET SUBSCRIBER STATS
// =============================================================================

export async function getSubscriberStats(): Promise<{
  success: boolean;
  data?: SubscriberStats;
  error?: string;
}> {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [total, active, unsubscribed, thisMonth, lastMonth] =
      await Promise.all([
        prisma.newsletterSubscriber.count(),
        prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
        prisma.newsletterSubscriber.count({
          where: { status: "UNSUBSCRIBED" },
        }),
        prisma.newsletterSubscriber.count({
          where: {
            subscribedAt: { gte: startOfMonth },
            status: "ACTIVE",
          },
        }),
        prisma.newsletterSubscriber.count({
          where: {
            subscribedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
            status: "ACTIVE",
          },
        }),
      ]);

    const growthRate =
      lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 100;

    return {
      success: true,
      data: {
        total,
        active,
        unsubscribed,
        thisMonth,
        lastMonth,
        growthRate: Math.round(growthRate * 10) / 10,
      },
    };
  } catch (error) {
    console.error("getSubscriberStats error:", error);
    return { success: false, error: "Failed to load stats" };
  }
}

// =============================================================================
// UPDATE SUBSCRIBER STATUS
// =============================================================================

export async function updateSubscriberStatus(
  subscriberId: string,
  status: SubscriptionStatus
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const updateData: Prisma.NewsletterSubscriberUpdateInput = { status };

    if (status === "UNSUBSCRIBED") {
      updateData.unsubscribedAt = new Date();
    } else if (status === "ACTIVE") {
      updateData.unsubscribedAt = null;
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriberId },
      data: updateData,
    });

    revalidatePath("/admin/newsletter");

    return { success: true, message: "Status updated" };
  } catch (error) {
    console.error("updateSubscriberStatus error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

// =============================================================================
// DELETE SUBSCRIBER
// =============================================================================

export async function deleteSubscriber(
  subscriberId: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.newsletterSubscriber.delete({
      where: { id: subscriberId },
    });

    revalidatePath("/admin/newsletter");

    return { success: true, message: "Subscriber deleted" };
  } catch (error) {
    console.error("deleteSubscriber error:", error);
    return { success: false, error: "Failed to delete subscriber" };
  }
}

// =============================================================================
// EXPORT SUBSCRIBERS
// =============================================================================

export async function exportSubscribers(): Promise<{
  success: boolean;
  data?: string;
  error?: string;
}> {
  try {
    await requireAdmin();

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "ACTIVE" },
      select: { email: true, subscribedAt: true, source: true },
      orderBy: { subscribedAt: "desc" },
    });

    // Create CSV
    const headers = ["Email", "Subscribed At", "Source"];
    const rows = subscribers.map((sub) => [
      sub.email,
      sub.subscribedAt.toISOString(),
      sub.source || "website",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    return { success: true, data: csv };
  } catch (error) {
    console.error("exportSubscribers error:", error);
    return { success: false, error: "Failed to export subscribers" };
  }
}

// =============================================================================
// BULK DELETE SUBSCRIBERS
// =============================================================================

export async function bulkDeleteSubscribers(
  subscriberIds: string[]
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.newsletterSubscriber.deleteMany({
      where: { id: { in: subscriberIds } },
    });

    revalidatePath("/admin/newsletter");

    return {
      success: true,
      message: `${subscriberIds.length} subscribers deleted`,
    };
  } catch (error) {
    console.error("bulkDeleteSubscribers error:", error);
    return { success: false, error: "Failed to delete subscribers" };
  }
}

// =============================================================================
// ADD SUBSCRIBER (Manual)
// =============================================================================

export async function addSubscriberManually(
  email: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already exists
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.status === "ACTIVE") {
        return { success: false, error: "Subscriber already exists" };
      }

      // Reactivate if previously unsubscribed
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          unsubscribedAt: null,
          subscribedAt: new Date(),
          source: "admin",
        },
      });

      revalidatePath("/admin/newsletter");
      return { success: true, message: "Subscriber reactivated" };
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        status: "ACTIVE",
        source: "admin",
      },
    });

    revalidatePath("/admin/newsletter");

    return { success: true, message: "Subscriber added" };
  } catch (error) {
    console.error("addSubscriberManually error:", error);
    return { success: false, error: "Failed to add subscriber" };
  }
}
