import 'server-only';
import nodemailer from 'nodemailer';

/**
 * Email notification service for NomNom cat feeder
 * Sends email notifications using Gmail SMTP
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Create Gmail transporter
 */
function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error('[Email] Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Send an email notification
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    console.error('[Email] Cannot send email: transporter not configured');
    return false;
  }

  try {
    console.log('[Email] Sending email to:', options.to, 'Subject:', options.subject);

    const info = await transporter.sendMail({
      from: `"NomNom" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('[Email] Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

/**
 * Send notification email when cat is begging for food
 */
export async function emailCatBegging(to: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: '🐱 Mèo đang xin ăn!',
    text: 'Mèo của bạn đang xin ăn. Bạn có muốn cho mèo ăn ngay không?',
  });
}

/**
 * Send notification email when automatic feeding occurs
 */
export async function emailAutoFeed(to: string, grams: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: '🍽️ Cho mèo ăn tự động',
    text: `NomNom đã tự động cho mèo ăn ${grams}g thức ăn theo lịch trình.`,
  });
}

/**
 * Send notification email when food container is running low
 */
export async function emailLowFood(to: string, distanceMm: number, estimatedPercentage: number): Promise<boolean> {
  return sendEmail({
    to,
    subject: '⚠️ Sắp hết thức ăn!',
    text: `Thùng chứa thức ăn dự trữ sắp hết (còn ~${estimatedPercentage}%). Vui lòng chuẩn bị thức ăn cho mèo.`,
  });
}

/**
 * Send notification email when environment is abnormal
 */
export async function emailAbnormalEnvironment(
  to: string,
  temperature: number,
  humidity: number,
  issue: 'temperature' | 'humidity' | 'both'
): Promise<boolean> {
  let message = '';

  if (issue === 'temperature') {
    message = `Nhiệt độ bất thường (${temperature}°C). Môi trường có thể khiến mèo không thoải mái.`;
  } else if (issue === 'humidity') {
    message = `Độ ẩm bất thường (${humidity}%). Môi trường có thể khiến mèo không thoải mái.`;
  } else {
    message = `Nhiệt độ (${temperature}°C) và độ ẩm (${humidity}%) bất thường. Môi trường có thể khiến mèo không thoải mái.`;
  }

  return sendEmail({
    to,
    subject: '🌡️ Môi trường bất thường',
    text: message,
  });
}