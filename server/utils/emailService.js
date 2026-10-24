import nodemailer from 'nodemailer';

// ── In-memory OTP store ──────────────────────────────────────
// Maps email → { otp, expiresAt }
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// ── Gmail transporter ─────────────────────────────────────────
let _transporter = null;

export function isEmailConfigured() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return true;
  }
  if (
    process.env.GMAIL_USER &&
    process.env.GMAIL_APP_PASSWORD &&
    process.env.GMAIL_USER !== 'your_gmail@gmail.com' &&
    process.env.GMAIL_APP_PASSWORD !== 'your_16_char_app_password'
  ) {
    return true;
  }
  return false;
}

export function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST) {
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const isSecure = process.env.SMTP_SECURE !== undefined
      ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
      : port === 465;

    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return _transporter;
}

// ── OTP helpers ───────────────────────────────────────────────
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(email, otp) {
  otpStore.set(email.toLowerCase().trim(), {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });
}

export function verifyOtp(email, otp) {
  const emailKey = email.toLowerCase().trim();
  const inputOtp = String(otp || '').trim();

  const record = otpStore.get(emailKey);
  if (!record) {
    return { valid: false, reason: 'No OTP found for this email. Please request a new code.' };
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(emailKey);
    return { valid: false, reason: 'Verification code has expired. Please request a new code.' };
  }
  if (record.otp !== inputOtp) {
    return { valid: false, reason: 'Invalid verification code. Please check your email and try again.' };
  }
  otpStore.delete(emailKey); // one-time use
  return { valid: true };
}

// ── Send OTP email ────────────────────────────────────────────
export async function sendOtpEmail(email, otp) {
  const transporter = getTransporter();
  const senderEmail = process.env.SMTP_FROM ||
    (process.env.SMTP_USER ? `"InternDesk" <${process.env.SMTP_USER}>` : `"InternDesk" <${process.env.GMAIL_USER}>`);

  const mailOptions = {
    from: senderEmail,
    to: email,
    subject: `${otp} is your InternDesk verification code`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Email Verification</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#0a66c2 0%,#004182 100%);padding:36px 40px;text-align:center;">
                      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">InternDesk</h1>
                      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Confirm Your Email Address</p>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 16px;color:#374151;font-size:16px;font-weight:600;">Welcome to InternDesk!</p>
                      <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
                        Use the 6-digit verification code below to complete your sign-up. This code expires in <strong>10 minutes</strong>.
                      </p>
                      <!-- OTP Box -->
                      <div style="background:#eff6ff;border:2px dashed #0a66c2;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
                        <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#0a66c2;display:inline-block;padding-left:12px;">${otp}</span>
                      </div>
                      <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">
                        If you didn't create an account with InternDesk, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} InternDesk · All rights reserved</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
