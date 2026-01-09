"use server";

import path from "path";
import ejs from "ejs";
import { sendMail } from "./mailer";

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
