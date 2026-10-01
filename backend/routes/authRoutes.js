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

// Direct student login via Phone Number
router.post('/student-login', async (req, res) => {
  try {
    const { phone_number } = req.body;
    
    if (!phone_number) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Check if the student is in the allowed_students table and active
    const student = await AllowedStudent.findOne({ where: { phone_number, status: 'active' } });
    
    if (!student) {
      return res.status(403).json({ message: 'No access to this website. You have not purchased the class.' });
    }

    // Direct Login - Generate Token
    const payload = {
      id: student.id,
      phone: student.phone_number,
      role: 'student'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, role: 'student', phone: student.phone_number });

  } catch (err) {
    console.error('Student Login Error:', err);
    res.status(500).json({ 
      message: 'Server error during login.', 
      details: err.message || err.toString()
    });
  }
});



module.exports = router;
