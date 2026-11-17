import { Resend } from 'resend';
import { config } from '../config.js';

const resend = config.EMAIL_PROVIDER === 'resend' ? new Resend(config.RESEND_API_KEY) : null;

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  if (resend) {
    await resend.emails.send({ from: config.EMAIL_FROM, ...opts });
  } else {
    // SMTP fallback menggunakan nodemailer
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport(process.env.SMTP_URL!);
    await transporter.sendMail({ from: config.EMAIL_FROM, ...opts });
  }
}