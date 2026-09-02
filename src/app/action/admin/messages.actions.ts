// app/action/admin/messages.actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { sendMail } from "@/lib/mailer";
import { Prisma } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

type MessageStatus = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

interface GetMessagesFilters {
  status?: MessageStatus;
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
  status: MessageStatus;
  createdAt: string;
  repliedAt?: string;
}

interface ContactMessageDetail extends ContactMessageItem {
  ipAddress?: string;
  userAgent?: string;
  reply?: string;
  repliedBy?: string;
}

interface MessageStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
}

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

// =============================================================================
// GET MESSAGES
// =============================================================================

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
    await requireAdmin();

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
          status: msg.status as MessageStatus,
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
// GET SINGLE MESSAGE
// =============================================================================

export async function getMessageById(id: string): Promise<{
  success: boolean;
  data?: ContactMessageDetail;
  error?: string;
}> {
  try {
    await requireAdmin();

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    return {
      success: true,
      data: {
        id: message.id,
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        status: message.status as MessageStatus,
        ipAddress: message.ipAddress || undefined,
        userAgent: message.userAgent || undefined,
        createdAt: message.createdAt.toISOString(),
        reply: message.reply || undefined,
        repliedAt: message.repliedAt?.toISOString(),
        repliedBy: message.repliedBy || undefined,
      },
    };
  } catch (error) {
    console.error("getMessageById error:", error);
    return { success: false, error: "Failed to load message" };
  }
}

// =============================================================================
// GET MESSAGE STATS
// =============================================================================

export async function getMessageStats(): Promise<{
  success: boolean;
  data?: MessageStats;
  error?: string;
}> {
  try {
    await requireAdmin();

    const [total, newCount, read, replied, archived] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
      prisma.contactMessage.count({ where: { status: "READ" } }),
      prisma.contactMessage.count({ where: { status: "REPLIED" } }),
      prisma.contactMessage.count({ where: { status: "ARCHIVED" } }),
    ]);

    return {
      success: true,
      data: {
        total,
        new: newCount,
        read,
        replied,
        archived,
      },
    };
  } catch (error) {
    console.error("getMessageStats error:", error);
    return { success: false, error: "Failed to load stats" };
  }
}

// =============================================================================
// UPDATE MESSAGE STATUS
// =============================================================================

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
): Promise<ActionResult> {
  try {
    await requireAdmin();

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
// ADD REPLY TO MESSAGE
// =============================================================================

export async function addReplyToMessage(
  messageId: string,
  replyContent: string
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    // Update message with reply
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        status: "REPLIED",
        reply: replyContent,
        repliedAt: new Date(),
        repliedBy: admin.id,
      },
    });

    // Send email reply
    try {
      await sendMail(
        message.email,
        `Re: ${message.subject}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <p>Dear ${message.name},</p>
            <p>${replyContent.replace(/\n/g, "<br>")}</p>
            <br>
            <p>Best regards,<br>Herbal Khana Team</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error("Failed to send reply email:", emailError);
      // Don't fail the action if email fails
    }

    revalidatePath("/admin/messages");
    revalidatePath(`/admin/messages/${messageId}`);

    return { success: true, message: "Reply sent successfully" };
  } catch (error) {
    console.error("addReplyToMessage error:", error);
    return { success: false, error: "Failed to send reply" };
  }
}

// =============================================================================
// DELETE MESSAGE
// =============================================================================

export async function deleteMessage(messageId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.contactMessage.delete({
      where: { id: messageId },
    });

    revalidatePath("/admin/messages");

    return { success: true, message: "Message deleted" };
  } catch (error) {
    console.error("deleteMessage error:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

// =============================================================================
// BULK DELETE MESSAGES
// =============================================================================

export async function bulkDeleteMessages(
  messageIds: string[]
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.contactMessage.deleteMany({
      where: { id: { in: messageIds } },
    });

    revalidatePath("/admin/messages");

    return { success: true, message: `${messageIds.length} messages deleted` };
  } catch (error) {
    console.error("bulkDeleteMessages error:", error);
    return { success: false, error: "Failed to delete messages" };
  }
}

// =============================================================================
// BULK UPDATE STATUS
// =============================================================================

export async function bulkUpdateMessageStatus(
  messageIds: string[],
  status: MessageStatus
): Promise<ActionResult> {
  try {
    await requireAdmin();

    await prisma.contactMessage.updateMany({
      where: { id: { in: messageIds } },
      data: { status },
    });

    revalidatePath("/admin/messages");

    return { success: true, message: `${messageIds.length} messages updated` };
  } catch (error) {
    console.error("bulkUpdateMessageStatus error:", error);
    return { success: false, error: "Failed to update messages" };
  }
}
