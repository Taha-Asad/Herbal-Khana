"use server";

import path from "path";
import ejs from "ejs";
import { sendMail } from "../mailer";

export const sendPaymentPendingEmail = async ({
  email,
  name,
  orderNumber,
  total,
  paymentMethod,
  paymentProofUrl,
}: {
  email: string;
  name?: string;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  paymentProofUrl: string;
}) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "payment-pending.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      name,
      orderNumber,
      total,
      paymentMethod,
      paymentProofUrl,
    });

    await sendMail(
      email,
      `Payment Pending • Order ${orderNumber}`,
      htmlContent
    );

    return { success: true };
  } catch (error) {
    console.error("Error sending payment pending email:", error);
    return { success: false };
  }
};

export const sendPaymentProofReceivedEmail = async ({
  email,
  name,
  orderNumber,
  total,
}: {
  email: string;
  name?: string;
  orderNumber: string;
  total: number;
}) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "payment-proof-received.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      name,
      orderNumber,
      total,
    });

    await sendMail(
      email,
      `Payment Proof Received • Order ${orderNumber}`,
      html
    );

    return { success: true };
  } catch (error) {
    console.error("Payment proof received email error:", error);
    return { success: false };
  }
};

export const sendPaymentRejectedEmail = async ({
  email,
  name,
  orderNumber,
  paymentProofUrl,
  adminNote,
}: {
  email: string;
  name?: string;
  orderNumber: string;
  paymentProofUrl: string;
  adminNote?: string; // optional
}) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "payment-rejected.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      name,
      orderNumber,
      paymentProofUrl,
      adminNote,
    });

    await sendMail(email, `Payment Rejected • Order ${orderNumber}`, html);

    return { success: true };
  } catch (error) {
    console.error("Payment rejected email error:", error);
    return { success: false };
  }
};

export const sendOrderConfirmationEmail = async ({
  email,
  name,
  orderNumber,
  estimatedDelivery,
  total,
  items, // add this
}: {
  email: string;
  name?: string;
  orderNumber: string;
  estimatedDelivery: Date | null;
  total: number;
  items?: { name: string; quantity: number; price: number }[]; // type for each item
}) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "order-confirmation.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      name,
      orderNumber,
      estimatedDelivery,
      total,
      items, // pass to template
    });

    await sendMail(email, `Order Confirmed • ${orderNumber}`, html);

    return { success: true };
  } catch (error) {
    console.error("Order confirmation email error:", error);
    return { success: false };
  }
};
