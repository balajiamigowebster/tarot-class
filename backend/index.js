require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const sequelize = require('./config/db');
const Course = require('./models/Course');
const SyllabusCategory = require('./models/SyllabusCategory');
const SyllabusVideo = require('./models/SyllabusVideo');
const SyllabusImage = require('./models/SyllabusImage');
const SyllabusPdf = require('./models/SyllabusPdf');
const LiveClass = require('./models/LiveClass');
const LiveClassRecording = require('./models/LiveClassRecording');
const LiveClassRegistration = require('./models/LiveClassRegistration');
const AllowedStudent = require('./models/AllowedStudent');

// Route imports
const contentRoutes = require('./routes/contentRoutes');
const accessRoutes = require('./routes/accessRoutes');
const syllabusRoutes = require('./routes/syllabusRoutes');
const liveClassRoutes = require('./routes/liveClassRoutes');
const authRoutes = require('./routes/authRoutes');
const studentSyncRoutes = require('./routes/studentSyncRoutes');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://tarot-class-lovat.vercel.app',
    'https://tarotclasses.saratarot.in',
    'https://www.tarotclasses.saratarot.in',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev')); // Logging

// Serve static files (like uploaded videos)
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/', (req, res) => {
  res.send('Tarot Classes API is running');
});

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'UP',
      database: 'Connected (Sequelize)',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date()
    });
  }
});

// API Routes
app.use('/api/content', contentRoutes);
app.use('/api/check-access', accessRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/save-student', studentSyncRoutes);

// Sync and Seed Database
const syncAndSeed = async () => {
  try {
    // 1. Explicitly ensure LiveClass and LiveClassRecording tables and columns exist
    try {
      await LiveClass.sync();
      await LiveClassRecording.sync();
      
      const [cols] = await sequelize.query("SHOW COLUMNS FROM `live_classes` LIKE 'startDate'");
      if (!cols || cols.length === 0) {
        await sequelize.query("ALTER TABLE `live_classes` ADD COLUMN `startDate` DATE NULL");
      }
      const [endCols] = await sequelize.query("SHOW COLUMNS FROM `live_classes` LIKE 'endDate'");
      if (!endCols || endCols.length === 0) {
        await sequelize.query("ALTER TABLE `live_classes` ADD COLUMN `endDate` DATE NULL");
      }
      const [statusCols] = await sequelize.query("SHOW COLUMNS FROM `live_classes` LIKE 'status'");
      if (!statusCols || statusCols.length === 0) {
        await sequelize.query("ALTER TABLE `live_classes` ADD COLUMN `status` VARCHAR(255) NOT NULL DEFAULT 'active'");
      }
      const [isLiveCols] = await sequelize.query("SHOW COLUMNS FROM `live_classes` LIKE 'isLive'");
      if (!isLiveCols || isLiveCols.length === 0) {
        await sequelize.query("ALTER TABLE `live_classes` ADD COLUMN `isLive` BOOLEAN NOT NULL DEFAULT FALSE");
      }
      console.log('✅ Live Class and Recording tables verified successfully');
    } catch (colErr) {
      console.warn('Live class migration notice:', colErr.message);
    }

    // 2. General sync (safe fallback)
    try {
      await sequelize.sync();
      console.log('✅ Sequelize Models Synced');
    } catch (syncErr) {
      console.warn('⚠️ General sync note (bypassed if keys full):', syncErr.message);
    }

    // Auto-seed if empty
    const courseCount = await Course.count();
    if (courseCount === 0) {
      console.log('🌱 Seeding database...');
      
      await Course.create({
        title: 'Tarot Card Reading Classes',
        slug: 'tarot-card-reading-classes',
        description: 'Step into the realm of Tarot and uncover the hidden truths waiting for you.'
      });

      console.log('🌱 Seed complete!');
    }

    // Seed Syllabus Categories if empty
    const syllabusCount = await SyllabusCategory.count();
    if (syllabusCount === 0) {
      console.log('🌱 Seeding Syllabus Categories...');
      const categories = [
        { name: "78 Cards Meaning", slug: "cards-meaning", description: "Complete meaning of all 78 cards" },
        { name: "Tarot Symbolic Meaning", slug: "symbolic-meaning", description: "Understand the hidden symbols" },
        { name: "Numbers Meaning", slug: "numbers-meaning", description: "The power of numbers in Tarot" },
        { name: "Colours Meaning", slug: "colours-meaning", description: "What colours reveal in cards" },
        { name: "Zodiac Sign Meaning", slug: "zodiac-sign-meaning", description: "Zodiac connections in Tarot" },
        { name: "Zodiac Connect with Tarot", slug: "zodiac-connect", description: "Bridging astrology and Tarot" },
        { name: "Elements Meaning", slug: "elements-meaning", description: "Fire, Water, Air, Earth in Tarot" },
        { name: "Elements connect with Tarot", slug: "elements-connect", description: "How elements influence readings" },
        { name: "Time Frames of Suits", slug: "time-frames", description: "Timing and prediction methods" },
        { name: "How to Spread", slug: "how-to-spread", description: "Learn different spreads" },
        { name: "Type of Spread", slug: "type-of-spread", description: "Choose the right spread for your query" },
        { name: "How to Cleanse Cards", slug: "how-to-cleanse", description: "Methods to purify your deck" },
        { name: "How to Awake your intuition", slug: "awaken-intuition", description: "Tips to develop inner guidance" },
        { name: "How to connect with Cards", slug: "connect-with-cards", description: "Build a personal bond with your deck" }
      ];
      await SyllabusCategory.bulkCreate(categories);
      console.log('🌱 Syllabus Categories seeded!');
    }
  } catch (err) {
    console.error('❌ Sync/Seed Error:', err);
  }
};

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await syncAndSeed();
});
