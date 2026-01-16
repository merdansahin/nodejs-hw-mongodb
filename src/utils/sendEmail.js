import nodemailer from 'nodemailer';
import createHttpError from 'http-errors';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
  process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
});

export async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (e) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.'
    );
  }
}
