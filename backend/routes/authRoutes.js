const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = router;
