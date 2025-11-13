import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config();


const buildTransporter = () => {
  if (process.env.NODE_ENV === 'test') {

    return {
      sendMail: async () => ({ accepted: [], response: 'test' }),
      verify: async () => true
    };
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set to send emails');
  }

  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: { user, pass },
      connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT) || 10000,
      greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT) || 5000,
      socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT) || 10000,
      logger: process.env.EMAIL_DEBUG === 'true',
      debug: process.env.EMAIL_DEBUG === 'true',
      tls: {
        rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false'
      }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    logger: process.env.EMAIL_DEBUG === 'true',
    debug: process.env.EMAIL_DEBUG === 'true'
  });
};

const transporter = buildTransporter();

// Only verify transporter when not in test environment to avoid open handles and network I/O during tests
if (process.env.NODE_ENV !== 'test') {
  transporter.verify().then(() => {
    console.log('SMTP transporter verified');
  }).catch((err) => {
    console.error('SMTP verification failed:', err && err.message ? err.message : err);
  });
}

// Simple helper to produce a clean text fallback from html
const htmlToTextFallback = (h) => {
  if (!h) return '';
  // remove tags and decode a few common entities
  const stripped = h.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  return stripped.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
};

// Wrap provided html body into a simple, modern email template (inline styles for clients)
const buildHtmlTemplate = ({ subject, bodyHtml }) => {
  const safeBody = bodyHtml || '';
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f4f6fb;">
      <table role="presentation" width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="padding:20px 0; text-align:center; background: linear-gradient(90deg,#4e54c8 0%, #8f94fb 100%);">
            <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:0.4px;">GearUp</h1>
            <div style="color:rgba(255,255,255,0.9);font-size:12px;margin-top:4px;">Order & Notification</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 16px;">
            <table role="presentation" width="100%" style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 6px 18px rgba(20,24,40,0.08);">
              <tr>
                <td style="padding:24px 28px;color:#111827;">
                  <h2 style="margin:0 0 12px 0;font-size:18px;color:#0f172a;">${subject || 'Notification from GearUp'}</h2>
                  <div style="color:#374151;font-size:14px;line-height:1.6;">
                    ${safeBody}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background:#f8fafc;padding:16px 28px;color:#6b7280;font-size:13px;border-top:1px solid rgba(15,23,42,0.04);">
                  <div>If you have any questions, reply to this email or contact our support team.</div>
                  <div style="margin-top:6px;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} GearUp. All rights reserved.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="text-align:center;padding:18px;font-size:12px;color:#9ca3af;">
            Sent with ❤️ by GearUp
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.FROM_EMAIL || process.env.EMAIL_USER;

  // Build the HTML email using our template when html is provided; otherwise leave undefined
  const builtHtml = html ? buildHtmlTemplate({ subject, bodyHtml: html }) : undefined;

  const mailOptions = {
    from,
    to,
    subject,
    text: text || (html ? htmlToTextFallback(html) : undefined),
    html: builtHtml || undefined
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('sendEmail error:', err && err.message ? err.message : err);
    throw err;
  }
};

export default sendEmail;
