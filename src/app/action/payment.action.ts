// actions/payment.actions.ts
"use server";

import { PaymentProofUpload } from "@/types/checkout";

import { getServerAuthSession } from "./user.action";
import prisma from "@/lib/prisma";
import {
  sendOrderConfirmationEmail,
  sendPaymentProofReceivedEmail,
  sendPaymentRejectedEmail,
} from "@/lib/email/order-emails";

// Upload payment proof
export async function uploadPaymentProof(input: PaymentProofUpload): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Please login" };
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: {
        id: input.orderId,
        userId: session.user.id,
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (order.paymentStatus !== "PENDING") {
      return { success: false, message: "Payment already processed" };
    }

    if (order.paymentMethod === "cod") {
      return {
        success: false,
        message: "COD orders do not require payment proof",
      };
    }

    // Update order with payment proof
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: JSON.stringify({
          transactionId: input.transactionId,
          senderName: input.senderName,
          senderPhone: input.senderPhone,
          proofImageUrl: input.proofImageUrl,
          notes: input.notes,
          uploadedAt: new Date().toISOString(),
          status: "pending_verification",
        }),
        adminNote: `Payment proof uploaded on ${new Date().toLocaleString()}. Awaiting verification.`,
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        message: "Payment proof uploaded, awaiting verification",
      },
    });

    // Send confirmation email to customer
    if (order.user.email) {
      if (order.user.email) {
        await sendPaymentProofReceivedEmail({
          email: order.user.email,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          name: order.user.name ?? undefined,
        });
      }
    }

    // TODO: Send notification to admin for verification
    // await sendAdminNotification({
    //   type: 'payment_proof_uploaded',
    //   orderId: order.id,
    //   orderNumber: order.orderNumber,
    // });

    return {
      success: true,
      message:
        "Payment proof uploaded successfully. We will verify and confirm your order within 24 hours.",
    };
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return { success: false, message: "Failed to upload payment proof" };
  }
}

// Admin: Verify payment and confirm order
export async function verifyPayment(
  orderId: string,
  approved: boolean,
  adminNote?: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // TODO: Check if user is admin
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    // });
    // if (user?.role !== 'ADMIN') {
    //   return { success: false, message: 'Unauthorized' };
    // }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true, name: true } },
        items: true,
      },
    });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    if (approved) {
      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "SUCCESS",
          status: "PROCESSING",
          paidAt: new Date(),
          adminNote: adminNote || "Payment verified by admin",
        },
      });

      // Update payment proof status
      if (order.paymentId) {
        const paymentData = JSON.parse(order.paymentId);
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentId: JSON.stringify({
              ...paymentData,
              status: "verified",
              verifiedAt: new Date().toISOString(),
              verifiedBy: session.user.id,
            }),
          },
        });
      }

      // Add timeline entry
      await prisma.orderTimeline.create({
        data: {
          orderId,
          status: "PROCESSING",
          message:
            "Payment verified and confirmed. Order is now being processed.",
          createdBy: session.user.id,
        },
      });

      // Send order confirmation email2
      if (order.user.email) {
        await sendOrderConfirmationEmail({
          email: order.user.email,
          name: order.user.name ?? undefined,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          estimatedDelivery: order.estimatedDelivery,
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
        });
      }

      return { success: true, message: "Payment verified and order confirmed" };
    } else {
      // Payment rejected
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
          adminNote: adminNote || "Payment verification failed",
        },
      });

      // Update payment proof status
      if (order.paymentId) {
        const paymentData = JSON.parse(order.paymentId);
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentId: JSON.stringify({
              ...paymentData,
              status: "rejected",
              rejectedAt: new Date().toISOString(),
              rejectedBy: session.user.id,
              rejectionReason: adminNote,
            }),
          },
        });
      }

      await prisma.orderTimeline.create({
        data: {
          orderId,
          status: "PENDING",
          message:
            adminNote ||
            "Payment verification failed. Please resubmit payment proof.",
          createdBy: session.user.id,
        },
      });

      // Send email to customer about failed verification
      if (order.user.email) {
        await sendPaymentRejectedEmail({
          email: order.user.email,
          name: order.user.name ?? undefined,
          orderNumber: order.orderNumber,
          paymentProofUrl: JSON.parse(order.paymentId || "{}").proofImageUrl,
          adminNote,
        });
      }

      return { success: true, message: "Payment rejected" };
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, message: "Failed to verify payment" };
  }
}

export interface PendingPaymentVerification {
  id: string;
  orderNumber: string;
  customer: {
    name: string | null;
    email: string | null;
  };
  total: number;
  paymentMethod: string | null;
  paymentProof: unknown | null;
  createdAt: string;
}

// Get pending payment verifications (for admin)
export async function getPendingPaymentVerifications(): Promise<{
  success: boolean;
  data?: PendingPaymentVerification[];
  error?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // TODO: Check if user is admin

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "PENDING",
        paymentMethod: { not: "cod" },
        paymentId: { not: null },
      },
      include: {
        user: { select: { email: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => {
      let paymentProof = null;
      if (order.paymentId) {
        try {
          paymentProof = JSON.parse(order.paymentId);
        } catch {
          paymentProof = null;
        }
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          name: order.user.name,
          email: order.user.email,
        },
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        paymentProof,
        createdAt: order.createdAt.toISOString(),
      };
    });

    return { success: true, data: formattedOrders };
  } catch (error) {
    console.error("Error getting pending verifications:", error);
    return { success: false, error: "Failed to load pending verifications" };
  }
}

// Resubmit payment proof (for customer)
export async function resubmitPaymentProof(input: PaymentProofUpload): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Please login" };
    }

    const order = await prisma.order.findUnique({
      where: {
        id: input.orderId,
        userId: session.user.id,
      },
    });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Check if payment was previously rejected
    if (order.paymentId) {
      const paymentData = JSON.parse(order.paymentId);
      if (paymentData.status !== "rejected") {
        return {
          success: false,
          message: "Payment proof already submitted and pending verification",
        };
      }
    }

    // Update with new payment proof
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PENDING",
        paymentId: JSON.stringify({
          transactionId: input.transactionId,
          senderName: input.senderName,
          senderPhone: input.senderPhone,
          proofImageUrl: input.proofImageUrl,
          notes: input.notes,
          uploadedAt: new Date().toISOString(),
          status: "pending_verification",
          isResubmission: true,
        }),
        adminNote: `Payment proof resubmitted on ${new Date().toLocaleString()}.`,
      },
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        message: "Payment proof resubmitted, awaiting verification",
      },
    });

    return {
      success: true,
      message:
        "Payment proof resubmitted successfully. We will verify shortly.",
    };
  } catch (error) {
    console.error("Error resubmitting payment proof:", error);
    return { success: false, message: "Failed to resubmit payment proof" };
  }
}
