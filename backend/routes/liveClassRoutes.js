const express = require('express');
const router = express.Router();
const LiveClass = require('../models/LiveClass');
const LiveClassRegistration = require('../models/LiveClassRegistration');

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
    const { email, isHost } = req.body;

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

    if (!isHost) {
      if (!email) {
        return res.status(403).json({ authorized: false, message: 'Email is required for students to join.' });
      }
      const registration = await LiveClassRegistration.findOne({ where: { email } });
      if (!registration) {
        return res.status(403).json({ authorized: false, message: 'You have not registered for the live classes. Please register on the home page first.' });
      }
    }
    
    res.json({ authorized: true, classData: liveClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register for Live Classes
router.post('/register', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    let registration = await LiveClassRegistration.findOne({ where: { email } });
    if (!registration) {
      registration = await LiveClassRegistration.create({ email, name });
    }
    
    res.status(200).json({ message: 'Successfully registered', registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
