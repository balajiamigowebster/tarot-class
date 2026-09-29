const express = require('express');
const router = express.Router();
const LiveClass = require('../models/LiveClass');

// Get all live classes
router.get('/', async (req, res) => {
  try {
    const classes = await LiveClass.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new live class
router.post('/', async (req, res) => {
  try {
    const { title, meetingUrl, allowedEmails } = req.body;
    
    // Parse allowedEmails if it's a comma separated string
    let emailsArray = [];
    if (typeof allowedEmails === 'string') {
      emailsArray = allowedEmails.split(',').map(e => e.trim()).filter(e => e);
    } else if (Array.isArray(allowedEmails)) {
      emailsArray = allowedEmails;
    }

    const newClass = await LiveClass.create({
      title,
      meetingUrl,
      allowedEmails: emailsArray
    });

    res.status(201).json(newClass);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify access to a live class
router.post('/verify-access/:id', async (req, res) => {
  try {
    const classId = req.params.id;

    const liveClass = await LiveClass.findByPk(classId);
    
    if (!liveClass) {
      return res.status(404).json({ authorized: false, message: 'Class not found' });
    }

    // Check expiration (30 days)
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const createdAtDate = new Date(liveClass.createdAt).getTime();
    const now = Date.now();

    if (now - createdAtDate > thirtyDaysInMs) {
      return res.status(403).json({ authorized: false, message: 'This class link has expired (older than 30 days).' });
    }

    // Email check removed as requested. We can add complex auth logic later.
    
    res.json({ authorized: true, classData: liveClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
