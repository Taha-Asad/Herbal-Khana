"use server";
import path from "path";
import { sendMail } from "../mailer";
import ejs from "ejs";
export const sendVerificationEmail = async ({
  email,
  name,
  verifyUrl,
}: {
  email: string;
  name: string;
  verifyUrl: string;
}) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "email-verification.ejs"
    );

    const htmlContent = await ejs.renderFile(templatePath, {
      name,
      verifyUrl: verifyUrl,
    });

    await sendMail(email, "Verify your Herbal Khana Account", htmlContent);

    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false };
  }
};
