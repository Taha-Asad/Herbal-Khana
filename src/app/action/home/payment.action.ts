// actions/payment.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "./user.action";
import {
  sendOrderConfirmationEmail,
  sendPaymentProofReceivedEmail,
  sendPaymentRejectedEmail,
} from "@/lib/email/order-emails";
import { uploadImageFromFile } from "../admin/products.actions";

// ============================================================================
// TYPES
// ============================================================================

interface PaymentProofData {
  transactionId?: string;
  senderName: string;
  senderPhone: string;
  proofImageUrl: string;
  notes?: string;
  uploadedAt: string;
  status: "pending_verification" | "verified" | "rejected";
  isResubmission?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

interface OrderForPaymentProof {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentProof: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface ActionResult {
  success: boolean;
  message?: string;
}

interface GetOrderResult {
  success: boolean;
  data?: OrderForPaymentProof;
  error?: string;
}

interface PendingPaymentVerification {
  id: string;
  orderNumber: string;
  customer: {
    name: string | null;
    email: string | null;
  };
  total: number;
  paymentMethod: string | null;
  paymentProof: PaymentProofData | null;
  createdAt: string;
}

interface GetPendingVerificationsResult {
  success: boolean;
  data?: PendingPaymentVerification[];
  error?: string;
}

// ============================================================================
// GET ORDER FOR PAYMENT PROOF
// ============================================================================

export async function getOrderForPaymentProof(
  orderId: string
): Promise<GetOrderResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Please login to view order" };
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentId: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Parse payment proof if exists
    let paymentProof: string | null = null;
    if (order.paymentId) {
      try {
        const paymentData = JSON.parse(order.paymentId) as PaymentProofData;
        paymentProof = paymentData.proofImageUrl || null;
      } catch {
        paymentProof = null;
      }
    }

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentProof,
        createdAt: order.createdAt.toISOString(),
        user: {
          name: order.user.name,
          email: order.user.email!,
        },
      },
    };
  } catch (error) {
    console.error("Get order error:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

// ============================================================================
// UPLOAD PAYMENT PROOF WITH IMAGE (Using FormData)
// ============================================================================

export async function uploadPaymentProofWithImage(
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Please login" };
    }

    // Extract form data
    const orderId = formData.get("orderId") as string;
    const senderName = formData.get("senderName") as string;
    const senderPhone = formData.get("senderPhone") as string;
    const transactionId = formData.get("transactionId") as string | null;
    const notes = formData.get("notes") as string | null;
    const proofImage = formData.get("proofImage") as File | null;

    // Validate required fields
    if (!orderId) {
      return { success: false, message: "Order ID is required" };
    }

    if (!senderName?.trim()) {
      return { success: false, message: "Sender name is required" };
    }

    if (!senderPhone?.trim()) {
      return { success: false, message: "Phone number is required" };
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
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

    // Upload image to UploadThings
    let proofImageUrl: string | null = null;

    if (proofImage && proofImage.size > 0) {
      proofImageUrl = await uploadImageFromFile(proofImage);

      if (!proofImageUrl) {
        return {
          success: false,
          message: "Failed to upload image. Please try again.",
        };
      }
    } else {
      return { success: false, message: "Payment proof image is required" };
    }

    // Create payment proof data
    const paymentProofData: PaymentProofData = {
      transactionId: transactionId?.trim() || undefined,
      senderName: senderName.trim(),
      senderPhone: senderPhone.trim(),
      proofImageUrl,
      notes: notes?.trim() || undefined,
      uploadedAt: new Date().toISOString(),
      status: "pending_verification",
    };

    // Update order with payment proof
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: JSON.stringify(paymentProofData),
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
      await sendPaymentProofReceivedEmail({
        email: order.user.email,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        name: order.user.name ?? undefined,
      });
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${order.id}`);

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

// ============================================================================
// LEGACY: UPLOAD PAYMENT PROOF (Without file upload - for URL-based uploads)
// ============================================================================

interface LegacyPaymentProofInput {
  orderId: string;
  transactionId?: string;
  senderName?: string;
  senderPhone?: string;
  proofImageUrl: string;
  notes?: string;
}

export async function uploadPaymentProof(
  input: LegacyPaymentProofInput
): Promise<ActionResult> {
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

    const paymentProofData: PaymentProofData = {
      transactionId: input.transactionId,
      senderName: input.senderName || "",
      senderPhone: input.senderPhone || "",
      proofImageUrl: input.proofImageUrl,
      notes: input.notes,
      uploadedAt: new Date().toISOString(),
      status: "pending_verification",
    };

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: JSON.stringify(paymentProofData),
        adminNote: `Payment proof uploaded on ${new Date().toLocaleString()}. Awaiting verification.`,
      },
    });

    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        message: "Payment proof uploaded, awaiting verification",
      },
    });

    if (order.user.email) {
      await sendPaymentProofReceivedEmail({
        email: order.user.email,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        name: order.user.name ?? undefined,
      });
    }

    revalidatePath("/orders");

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

// ============================================================================
// ADMIN: VERIFY PAYMENT
// ============================================================================

export async function verifyPayment(
  orderId: string,
  approved: boolean,
  adminNote?: string
): Promise<ActionResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, message: "Unauthorized" };
    }

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

    // Parse existing payment data
    let paymentData: PaymentProofData | null = null;
    if (order.paymentId) {
      try {
        paymentData = JSON.parse(order.paymentId) as PaymentProofData;
      } catch {
        paymentData = null;
      }
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
          paymentId: paymentData
            ? JSON.stringify({
                ...paymentData,
                status: "verified",
                verifiedAt: new Date().toISOString(),
                verifiedBy: session.user.id,
              })
            : order.paymentId,
        },
      });

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

      // Send order confirmation email
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

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);

      return { success: true, message: "Payment verified and order confirmed" };
    } else {
      // Payment rejected
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
          adminNote: adminNote || "Payment verification failed",
          paymentId: paymentData
            ? JSON.stringify({
                ...paymentData,
                status: "rejected",
                rejectedAt: new Date().toISOString(),
                rejectedBy: session.user.id,
                rejectionReason: adminNote,
              })
            : order.paymentId,
        },
      });

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

      // Send rejection email
      if (order.user.email && paymentData) {
        await sendPaymentRejectedEmail({
          email: order.user.email,
          name: order.user.name ?? undefined,
          orderNumber: order.orderNumber,
          paymentProofUrl: paymentData.proofImageUrl,
          adminNote,
        });
      }

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);

      return { success: true, message: "Payment rejected" };
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, message: "Failed to verify payment" };
  }
}

// ============================================================================
// ADMIN: GET PENDING PAYMENT VERIFICATIONS
// ============================================================================

export async function getPendingPaymentVerifications(): Promise<GetPendingVerificationsResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

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

    const formattedOrders: PendingPaymentVerification[] = orders.map(
      (order) => {
        let paymentProof: PaymentProofData | null = null;
        if (order.paymentId) {
          try {
            paymentProof = JSON.parse(order.paymentId) as PaymentProofData;
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
      }
    );

    return { success: true, data: formattedOrders };
  } catch (error) {
    console.error("Error getting pending verifications:", error);
    return { success: false, error: "Failed to load pending verifications" };
  }
}

// ============================================================================
// RESUBMIT PAYMENT PROOF
// ============================================================================

export async function resubmitPaymentProof(
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return { success: false, message: "Please login" };
    }

    const orderId = formData.get("orderId") as string;
    const senderName = formData.get("senderName") as string;
    const senderPhone = formData.get("senderPhone") as string;
    const transactionId = formData.get("transactionId") as string | null;
    const notes = formData.get("notes") as string | null;
    const proofImage = formData.get("proofImage") as File | null;

    if (!orderId) {
      return { success: false, message: "Order ID is required" };
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Check if payment was previously rejected
    if (order.paymentId) {
      try {
        const paymentData = JSON.parse(order.paymentId) as PaymentProofData;
        if (paymentData.status !== "rejected") {
          return {
            success: false,
            message: "Payment proof already submitted and pending verification",
          };
        }
      } catch {
        // Continue with resubmission
      }
    }

    // Upload new image
    let proofImageUrl: string | null = null;

    if (proofImage && proofImage.size > 0) {
      proofImageUrl = await uploadImageFromFile(proofImage);

      if (!proofImageUrl) {
        return {
          success: false,
          message: "Failed to upload image. Please try again.",
        };
      }
    } else {
      return { success: false, message: "Payment proof image is required" };
    }

    const paymentProofData: PaymentProofData = {
      transactionId: transactionId?.trim() || undefined,
      senderName: senderName.trim(),
      senderPhone: senderPhone.trim(),
      proofImageUrl,
      notes: notes?.trim() || undefined,
      uploadedAt: new Date().toISOString(),
      status: "pending_verification",
      isResubmission: true,
    };

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PENDING",
        paymentId: JSON.stringify(paymentProofData),
        adminNote: `Payment proof resubmitted on ${new Date().toLocaleString()}.`,
      },
    });

    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        message: "Payment proof resubmitted, awaiting verification",
      },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${order.id}`);

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
