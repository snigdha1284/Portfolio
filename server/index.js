/**
 * index.js — Express application entry point
 * Boots the server, registers middleware, and mounts routes.
 */
'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const contactRouter = require('./routes/contact');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Startup env check ────────────────────────────────────────────────────────
// The server will always start; email sending requires real SMTP credentials.
(function checkEnv() {
  const placeholders = ['your_gmail_address@gmail.com', 'your_16_char_app_password', ''];
  const smtpOk =
    process.env.SMTP_USER && !placeholders.includes(process.env.SMTP_USER) &&
    process.env.SMTP_PASS && !placeholders.includes(process.env.SMTP_PASS);

  if (!smtpOk) {
    console.warn('\n⚠️  WARNING: SMTP credentials not configured.');
    console.warn('   The server will start, but emails will NOT be sent.');
    console.warn('   → Open server/.env and fill in SMTP_USER and SMTP_PASS.');
    console.warn('   → For Gmail: enable 2-Step Verification → generate an App Password.\n');
  }
})();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*', // Restrict to your domain in production
  methods: ['POST', 'GET'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve frontend static files ───────────────────────────────────────────────
// Serves index.html, styles.css, script.js, assets/ from the parent folder
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    smtp_configured: !!(
      process.env.SMTP_USER &&
      process.env.SMTP_USER !== 'your_gmail_address@gmail.com' &&
      process.env.SMTP_PASS &&
      process.env.SMTP_PASS !== 'your_16_char_app_password'
    ),
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/contact', contactRouter);

// ── 404 Fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Portfolio running       → http://localhost:${PORT}`);
  console.log(`🔍  Health check           → http://localhost:${PORT}/health`);
  console.log(`📬  Contact API            → POST http://localhost:${PORT}/contact`);
  console.log(`\n   Open http://localhost:${PORT} in your browser to view the site.\n`);
});
