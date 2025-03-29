import nodemailer from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: getEnvVar('SMTP_HOST'),
    port: getEnvVar('SMTP_PORT'),
    secure: false,
    auth: {
      user: getEnvVar('SMTP_USER'),
      pass: getEnvVar('SMTP_PASSWORD'),
    },
  });
};

export const sendResetPasswordEmail = async (to, resetLink) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: getEnvVar('SMTP_FROM'),
    to,
    subject: 'Password Recovery',
html: `
  <h1>Password Recovery</h1>
  <p>You received this email because you requested a password reset for your account.</p>
  <p>Please click the link below to reset your password:</p>
  <p><a href="${resetLink}">Reset Password</a></p>
  <p>The link is valid for 5 minutes.</p>
  <p>If you did not request a password reset, please ignore this email.</p>
  <p>Best regards,<br>Support Team</p>
`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};