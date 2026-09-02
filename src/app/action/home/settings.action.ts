// lib/actions/settings.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import type { NotificationPreferences, ActionResponse } from "@/types/account";

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

// Settings are stored in the Setting model with key-value pairs
// We use userId as part of the key

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<
  ActionResponse<NotificationPreferences>
> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const setting = await prisma.setting.findUnique({
      where: { key: `user_notifications_${userId}` },
    });

    const defaultPreferences: NotificationPreferences = {
      emailNotifications: true,
      smsNotifications: true,
      orderUpdates: true,
      promotionalEmails: false,
      newsletter: false,
    };

    if (!setting) {
      return { success: true, data: defaultPreferences };
    }

    return {
      success: true,
      data: { ...defaultPreferences, ...(setting.value as object) },
    };
  } catch (error) {
    console.error("Failed to get notification preferences:", error);
    return { success: false, error: "Failed to load preferences" };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<ActionResponse<NotificationPreferences>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const key = `user_notifications_${userId}`;

    const existing = await prisma.setting.findUnique({
      where: { key },
    });

    const currentPreferences = (existing?.value as object) || {};
    const newPreferences = { ...currentPreferences, ...preferences };

    await prisma.setting.upsert({
      where: { key },
      update: { value: newPreferences },
      create: { key, value: newPreferences },
    });

    revalidatePath("/account/settings");

    return {
      success: true,
      data: newPreferences as NotificationPreferences,
      message: "Preferences updated",
    };
  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}

/**
 * Export user data (GDPR compliance)
 */
export async function exportUserData(): Promise<ActionResponse<object>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        orders: {
          include: { items: true },
        },
        reviews: true,
        bookmarks: {
          include: { product: { select: { name: true, slug: true } } },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Remove sensitive data
    const { password, resetToken, emailVerifyToken, ...safeUser } = user;

    return {
      success: true,
      data: safeUser,
      message: "Data exported successfully",
    };
  } catch (error) {
    console.error("Failed to export user data:", error);
    return { success: false, error: "Failed to export data" };
  }
}

/**
 * Get active sessions
 */
export async function getActiveSessions(): Promise<
  ActionResponse<{ id: string; createdAt: Date; expiresAt: Date }[]>
> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        expiresAt: true,
      },
      orderBy: { expiresAt: "desc" },
    });

    // Add createdAt approximation (session doesn't have createdAt in your schema)
    const sessionsWithCreatedAt = sessions.map((s) => ({
      id: s.id,
      expiresAt: s.expiresAt,
      createdAt: new Date(s.expiresAt.getTime() - 30 * 24 * 60 * 60 * 1000), // Approximate
    }));

    return { success: true, data: sessionsWithCreatedAt };
  } catch (error) {
    console.error("Failed to get sessions:", error);
    return { success: false, error: "Failed to load sessions" };
  }
}

/**
 * Revoke a session
 */
export async function revokeSession(
  sessionId: string
): Promise<ActionResponse<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.session.delete({
      where: {
        id: sessionId,
        userId, // Ensure user owns this session
      },
    });

    return { success: true, message: "Session revoked" };
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return { success: false, error: "Failed to revoke session" };
  }
}

/**
 * Revoke all other sessions
 */
export async function revokeAllOtherSessions(
  currentSessionToken: string
): Promise<ActionResponse<void>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.session.deleteMany({
      where: {
        userId,
        token: { not: currentSessionToken },
      },
    });

    return { success: true, message: "All other sessions revoked" };
  } catch (error) {
    console.error("Failed to revoke sessions:", error);
    return { success: false, error: "Failed to revoke sessions" };
  }
}
