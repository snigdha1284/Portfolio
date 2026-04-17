/**
 * utils/mailer.js
 * Configures and exports the Nodemailer transporter.
 * All SMTP credentials are pulled from environment variables — never hardcoded.
 */
'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for port 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a contact form email.
 * @param {{ name: string, email: string, message: string }} data
 * @returns {Promise<void>}
 */
async function sendContactEmail({ name, email, message }) {
  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to: process.env.RECEIVER_EMAIL,
    replyTo: email,
    subject: `New message from ${name} — Portfolio`,
    text: `
Name:    ${name}
Email:   ${email}

Message:
${message}
    `.trim(),
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9f7f3;border-radius:8px;color:#0a0f16;">
        <h2 style="color:#c5a059;margin-bottom:24px;">New Portfolio Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr style="border:none;border-top:1px solid #e0d8cc;margin:24px 0;" />
        <p style="white-space:pre-wrap;">${message}</p>
        <hr style="border:none;border-top:1px solid #e0d8cc;margin:24px 0;" />
        <p style="font-size:12px;color:#999;">This email was sent from your portfolio contact form.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Email sent successfully:', info.messageId);
}

module.exports = { sendContactEmail };
