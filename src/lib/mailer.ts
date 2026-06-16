"use server";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // or your SMTP host
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"Herbal khana" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
