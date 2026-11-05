const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const AllowedStudent = require('../models/AllowedStudent');
const User = require('../models/User');

// In-memory store for OTPs (in production, use Redis or DB)
const otpStore = {};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Look for user in MySQL users table
    let user = await User.findOne({ where: { email: cleanEmail } });
    
    // Fallback: if not in database yet, check .env & auto-seed into DB
    if (!user) {
      const envUsers = [
        {
          email: (process.env.ADMIN_EMAIL || 'admin@tarot.com').toLowerCase(),
          rawPassword: process.env.ADMIN_PASSWORD || 'adminpassword',
          role: 'admin',
          name: 'Sara Tarot Admin'
        },
        {
          email: (process.env.HOST_EMAIL || 'host@tarot.com').toLowerCase(),
          rawPassword: process.env.HOST_PASSWORD || 'hostpassword',
          role: 'host',
          name: 'Sara Tarot Host'
        }
      ];

      const matchedEnvUser = envUsers.find(u => u.email === cleanEmail);
      if (matchedEnvUser && matchedEnvUser.rawPassword === password) {
        // Hash password with bcrypt and save to MySQL users table
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
          user = await User.create({
            name: matchedEnvUser.name,
            email: matchedEnvUser.email,
            password: hashedPassword,
            role: matchedEnvUser.role
          });
        } catch (createErr) {
          console.error('Error auto-creating user:', createErr);
        }
        
        const payload = {
          id: user ? user.id : 1,
          email: matchedEnvUser.email,
          role: matchedEnvUser.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token, role: matchedEnvUser.role, name: matchedEnvUser.name });
      }

      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare hashed password stored in MySQL table using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.error('Login Error:', err);
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

    const rawPhone = String(phone_number || '').trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');
    const tenDigits = digitsOnly.slice(-10);

    const possibleNumbers = Array.from(new Set([
      rawPhone,
      digitsOnly,
      tenDigits,
      `+91${tenDigits}`,
      `91${tenDigits}`
    ])).filter(Boolean);

    // Check if the student is in the allowed_students table and active
    const student = await AllowedStudent.findOne({ 
      where: { 
        phone_number: { [Op.in]: possibleNumbers }, 
        status: 'active' 
      } 
    });
    
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
    
    res.json({ success: true, token, role: 'student', phone: student.phone_number, name: student.name });

  } catch (err) {
    console.error('Student Login Error:', err);
    res.status(500).json({ 
      message: 'Server error during login.', 
      details: err.message || err.toString()
    });
  }
});



module.exports = router;
