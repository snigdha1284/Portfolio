/**
 * controllers/contactController.js
 * Handles the business logic for the POST /contact route.
 * Delegates email sending to the mailer utility.
 */
'use strict';

const { sendContactEmail } = require('../utils/mailer');

async function handleContact(req, res) {
  try {
    // req.contactData is populated and sanitised by validateContact middleware
    const { name, email, message } = req.contactData;

    await sendContactEmail({ name, email, message });

    return res.status(200).json({
      success: true,
      message: 'Your message was sent successfully! I\'ll get back to you soon.',
    });
  } catch (err) {
    console.error('[ContactController] Failed to send email:', err.message);

    return res.status(500).json({
      success: false,
      errors: ['Failed to send your message. Please try again later.'],
    });
  }
}

module.exports = { handleContact };
