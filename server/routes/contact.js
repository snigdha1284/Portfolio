/**
 * routes/contact.js
 * Defines the POST /contact route.
 * Middleware chain: validateContact → handleContact
 */
'use strict';

const { Router } = require('express');
const { validateContact } = require('../middleware/validate');
const { handleContact } = require('../controllers/contactController');

const router = Router();

// POST /contact
router.post('/', validateContact, handleContact);

module.exports = router;
