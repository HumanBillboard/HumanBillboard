const express = require('express');
const router = express.Router();
const { addToWaitlist, getWaitlist } = require('../controllers/waitlistController');

// POST /api/waitlist
router.post('/', addToWaitlist);

// GET /api/waitlist
router.get('/', getWaitlist);

module.exports = router;
