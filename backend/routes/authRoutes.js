const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const AllowedStudent = require('../models/AllowedStudent');

// In-memory store for OTPs (in production, use Redis or DB)
const otpStore = {};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // We mock the DB users based on .env
    const users = [
      {
        email: process.env.ADMIN_EMAIL,
        passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || '', 10),
        role: 'admin'
      },
      {
        email: process.env.HOST_EMAIL,
        passwordHash: bcrypt.hashSync(process.env.HOST_PASSWORD || '', 10),
        role: 'host'
      }
    ];

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, role: user.role });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request OTP for student login via Email
router.post('/request-otp', async (req, res) => {
  try {
    const { phone_number, email } = req.body;
    
    if (!phone_number || !email) {
      return res.status(400).json({ message: 'Phone number and Email are required' });
    }

    const student = await AllowedStudent.findOne({ where: { phone_number, status: 'active' } });
    if (!student) {
      return res.status(403).json({ message: 'Phone number not registered or inactive.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store it with expiration (e.g., 5 mins)
    otpStore[phone_number] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 
    };

    // Send Email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL, 
        pass: process.env.SMTP_PASSWORD 
      }
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Your Tarot Classes Login OTP',
      text: `Your OTP for logging into Tarot Classes is: ${otp}. It is valid for 5 minutes. Do not share this with anyone.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] OTP ${otp} sent to ${email} for phone ${phone_number}`);

    res.json({ success: true, message: 'OTP sent successfully to your email' });

  } catch (err) {
    console.error('OTP Send Error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Please check server email configuration.' });
  }
});

// Verify OTP for student login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone_number, otp } = req.body;
    
    if (!phone_number || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const storedOtpData = otpStore[phone_number];

    if (!storedOtpData) {
      return res.status(400).json({ message: 'No OTP requested for this phone number' });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      delete otpStore[phone_number];
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedOtpData.otp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP matches, delete it
    delete otpStore[phone_number];

    // Check if student exists just to be safe
    const student = await AllowedStudent.findOne({ where: { phone_number, status: 'active' } });
    if (!student) {
      return res.status(403).json({ message: 'Account no longer active' });
    }

    const payload = {
      id: student.id,
      phone: student.phone_number,
      role: 'student'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, role: 'student', phone: student.phone_number });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
