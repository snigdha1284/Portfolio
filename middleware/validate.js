/**
 * middleware/validate.js
 * Express middleware that validates contact form inputs before
 * they reach the controller. Short-circuits with 400 Bad Request
 * if anything is missing or malformed.
 */
'use strict';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContact(req, res, next) {
  const { name, email, message } = req.body;
  const errors = [];

  //── Name ──────────────────────────────────────────────
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }
  if (name && name.trim().length > 100) {
    errors.push('Name must not exceed 100 characters.');
  }

  // ── Email ─────────────────────────────────────────────
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  // ── Message ───────────────────────────────────────────
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters.');
  }
  if (message && message.trim().length > 2000) {
    errors.push('Message must not exceed 2000 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Sanitise and attach cleaned values for the controller
  req.contactData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
  };

  next();
}

module.exports = { validateContact };
