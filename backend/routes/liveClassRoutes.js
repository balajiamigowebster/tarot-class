const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const LiveClass = require('../models/LiveClass');
const LiveClassRegistration = require('../models/LiveClassRegistration');
const LiveClassRecording = require('../models/LiveClassRecording');
const AllowedStudent = require('../models/AllowedStudent');
const recordingUpload = require('../middleware/recordingUpload');

// ==========================================
// LIVE CLASS ROUTES
// ==========================================

// Helper to determine if a class is active or expired
const computeClassStatus = (cls) => {
  const now = new Date();
  if (cls.endDate) {
    const end = new Date(cls.endDate);
    end.setHours(23, 59, 59, 999);
    return now <= end ? 'active' : 'expired';
  }
  // Fallback to 30 days from createdAt
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const createdAtDate = new Date(cls.createdAt).getTime();
  return (now.getTime() - createdAtDate <= thirtyDaysInMs) ? 'active' : 'expired';
};

// Get all live classes
router.get('/', async (req, res) => {
  try {
    const classes = await LiveClass.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    // Attach dynamic computed status & dates
    const enrichedClasses = classes.map(c => {
      const plain = c.toJSON();
      const currentStatus = computeClassStatus(plain);
      return {
        ...plain,
        dynamicStatus: currentStatus,
        isExpired: currentStatus === 'expired'
      };
    });

    res.json(enrichedClasses);
  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new live class
router.post('/', async (req, res) => {
  try {
    const { title, meetingUrl, allowedEmails, startDate, endDate } = req.body;
    
    // Parse allowedEmails if it's a comma separated string
    let emailsArray = [];
    if (typeof allowedEmails === 'string') {
      emailsArray = allowedEmails.split(',').map(e => e.trim()).filter(e => e);
    } else if (Array.isArray(allowedEmails)) {
      emailsArray = allowedEmails;
    }

    // Default dates: startDate = today, endDate = today + 30 days
    const now = new Date();
    const defaultStartDate = startDate || now.toISOString().split('T')[0];
    
    let defaultEndDate = endDate;
    if (!defaultEndDate) {
      const end = new Date(defaultStartDate);
      end.setDate(end.getDate() + 30);
      defaultEndDate = end.toISOString().split('T')[0];
    }

    const newClass = await LiveClass.create({
      title,
      meetingUrl: meetingUrl || `tarot-class-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      allowedEmails: emailsArray,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      status: 'active'
    });

    const plain = newClass.toJSON();
    plain.dynamicStatus = 'active';
    plain.isExpired = false;

    res.status(201).json(plain);
  } catch (error) {
    console.error('Error creating live class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a live class
router.delete('/:id', async (req, res) => {
  try {
    const classId = req.params.id;
    const cls = await LiveClass.findByPk(classId);
    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }
    await cls.destroy();
    res.json({ message: 'Live class deleted successfully' });
  } catch (error) {
    console.error('Error deleting live class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start a live class (host goes live)
router.post('/:id/start', async (req, res) => {
  try {
    const classId = req.params.id;
    const cls = await LiveClass.findByPk(classId);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    cls.isLive = true;
    await cls.save();
    res.json({ message: 'Class is now live', isLive: true });
  } catch (error) {
    console.error('Error starting live class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// End a live class
router.post('/:id/end', async (req, res) => {
  try {
    const classId = req.params.id;
    const cls = await LiveClass.findByPk(classId);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    cls.isLive = false;
    await cls.save();
    res.json({ message: 'Class ended', isLive: false });
  } catch (error) {
    console.error('Error ending live class:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify access to a live class (accepts either numeric ID or meetingUrl)
router.post('/verify-access/:id', async (req, res) => {
  try {
    const identifier = req.params.id;
    const { email, phone, isHost } = req.body;

    let liveClass = null;
    if (!isNaN(identifier) && Number.isInteger(Number(identifier))) {
      liveClass = await LiveClass.findByPk(Number(identifier));
    }
    
    if (!liveClass) {
      liveClass = await LiveClass.findOne({
        where: { meetingUrl: identifier }
      });
    }
    
    if (!liveClass) {
      return res.status(404).json({ authorized: false, message: 'Class not found' });
    }

    // Check expiration based on endDate or 30 days
    const status = computeClassStatus(liveClass);
    if (status === 'expired') {
      return res.status(403).json({ 
        authorized: false, 
        message: 'This live class link has expired (the 30-day class validity period has ended).' 
      });
    }

    // Host has immediate authorization & marks class as live
    if (isHost) {
      if (!liveClass.isLive) {
        liveClass.isLive = true;
        await liveClass.save();
      }
      return res.json({ authorized: true, isLive: true, isWaiting: false, classData: liveClass, role: 'host' });
    }

    // Check student authorization
    let isAuthorizedStudent = false;

    if (email) {
      const registration = await LiveClassRegistration.findOne({ where: { email } });
      const inAllowedEmails = liveClass.allowedEmails && liveClass.allowedEmails.includes(email);
      if (registration || inAllowedEmails) {
        isAuthorizedStudent = true;
      }
    }

    if (!isAuthorizedStudent && phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      const student = await AllowedStudent.findOne({
        where: {
          phone_number: { [Op.like]: `%${cleanPhone}%` }
        }
      });
      if (student && student.status === 'active') {
        isAuthorizedStudent = true;
      }
    }

    if (!isAuthorizedStudent && req.headers.authorization) {
      isAuthorizedStudent = true;
    }

    if (!isAuthorizedStudent) {
      return res.status(403).json({ 
        authorized: false, 
        message: 'Access denied. Please enter your registered email or active phone number to join.' 
      });
    }

    // Ensure Host has joined first!
    if (!liveClass.isLive) {
      return res.json({
        authorized: true,
        isWaiting: true,
        isLive: false,
        classTitle: liveClass.title,
        message: 'The teacher has not started the class yet. Please wait, you will enter automatically when the host joins.'
      });
    }

    // Host is live and student is authorized
    return res.json({ authorized: true, isWaiting: false, isLive: true, classData: liveClass, role: 'student' });
  } catch (error) {
    console.error('Error verifying class access:', error);
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
    console.error('Error in live class register:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==========================================
// RECORDINGS ROUTES (30 DAYS STORAGE POLICY)
// ==========================================

// Helper to calculate days remaining
const calculateRecordingExpiry = (rec) => {
  const now = new Date();
  const expiry = new Date(rec.expiryDate);
  expiry.setHours(23, 59, 59, 999);
  
  const diffMs = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return {
    daysRemaining: Math.max(0, daysRemaining),
    isExpired: daysRemaining < 0
  };
};

// Get all recordings
router.get('/recordings', async (req, res) => {
  try {
    const recordings = await LiveClassRecording.findAll({
      order: [['recordedDate', 'DESC'], ['id', 'DESC']]
    });

    const enriched = recordings.map(r => {
      const plain = r.toJSON();
      const expiryInfo = calculateRecordingExpiry(plain);
      return {
        ...plain,
        daysRemaining: expiryInfo.daysRemaining,
        isExpired: expiryInfo.isExpired
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ error: 'Server error fetching recordings' });
  }
});

// Add a live class recording (via file upload or video link)
router.post('/recordings', recordingUpload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      recordedDate,
      validityDays,
      videoUrl: externalVideoUrl,
      liveClassId
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let videoUrl = externalVideoUrl || '';
    let thumbnailUrl = '';

    if (req.files) {
      if (req.files.video && req.files.video.length > 0) {
        videoUrl = `/api/uploads/recordings/${req.files.video[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        thumbnailUrl = `/api/uploads/recordings/${req.files.thumbnail[0].filename}`;
      }
    }

    if (!videoUrl) {
      return res.status(400).json({ error: 'Please upload a video file or provide a video URL' });
    }

    // Set recordedDate (default: today)
    const recDate = recordedDate || new Date().toISOString().split('T')[0];
    
    // Set expiryDate (default: 30 days from recordedDate)
    const days = parseInt(validityDays, 10) || 30;
    const expDateObj = new Date(recDate);
    expDateObj.setDate(expDateObj.getDate() + days);
    const expiryDate = expDateObj.toISOString().split('T')[0];

    const recording = await LiveClassRecording.create({
      liveClassId: liveClassId ? parseInt(liveClassId, 10) : null,
      title,
      description: description || '',
      videoUrl,
      thumbnailUrl: thumbnailUrl || null,
      duration: duration || '',
      recordedDate: recDate,
      expiryDate
    });

    const plain = recording.toJSON();
    const expiryInfo = calculateRecordingExpiry(plain);
    plain.daysRemaining = expiryInfo.daysRemaining;
    plain.isExpired = expiryInfo.isExpired;

    res.status(201).json(plain);
  } catch (error) {
    console.error('Error creating recording:', error);
    res.status(500).json({ error: error.message || 'Failed to save recording' });
  }
});

// Delete recording (and remove video file from uploads if local)
router.delete('/recordings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const recording = await LiveClassRecording.findByPk(id);
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    // If local file, safely remove from disk
    if (recording.videoUrl && recording.videoUrl.startsWith('/api/uploads/recordings/')) {
      const fileName = path.basename(recording.videoUrl);
      const filePath = path.join(__dirname, '..', 'uploads', 'recordings', fileName);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.warn('Could not delete video file:', e); }
      }
    }

    if (recording.thumbnailUrl && recording.thumbnailUrl.startsWith('/api/uploads/recordings/')) {
      const thumbName = path.basename(recording.thumbnailUrl);
      const thumbPath = path.join(__dirname, '..', 'uploads', 'recordings', thumbName);
      if (fs.existsSync(thumbPath)) {
        try { fs.unlinkSync(thumbPath); } catch (e) { console.warn('Could not delete thumb file:', e); }
      }
    }

    await recording.destroy();
    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
