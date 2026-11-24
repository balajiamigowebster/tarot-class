require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
const User = require('./models/User');
const bcrypt = require('bcryptjs');

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

// Universal CORS Middleware with preflight handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev')); // Logging

// Helper for fast, progressive HTTP 206 video range streaming
const streamVideoFile = (requestedPath, req, res) => {
  let resolvedPath = requestedPath;
  
  if (!fs.existsSync(resolvedPath)) {
    if (fs.existsSync(resolvedPath + '.mp4')) {
      resolvedPath = resolvedPath + '.mp4';
    } else if (fs.existsSync(resolvedPath + '.webm')) {
      resolvedPath = resolvedPath + '.webm';
    } else {
      return res.status(404).json({ error: 'Video file not found on server' });
    }
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  
  // If it's an image, serve standard static
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
    return res.sendFile(resolvedPath);
  }

  const stat = fs.statSync(resolvedPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  // Reliably detect video container & MIME type (supports .mp4, .webm, and extensionless files)
  let contentType = 'video/mp4';
  if (ext === '.webm') {
    contentType = 'video/webm';
  } else if (ext === '.mp4') {
    contentType = 'video/mp4';
  } else {
    try {
      const fd = fs.openSync(resolvedPath, 'r');
      const headerBuf = Buffer.alloc(128);
      fs.readSync(fd, headerBuf, 0, 128, 0);
      fs.closeSync(fd);
      // WebM EBML signature (0x1A 0x45 0xDF 0xA3) or ASCII "webm"
      if ((headerBuf[0] === 0x1a && headerBuf[1] === 0x45 && headerBuf[2] === 0xdf && headerBuf[3] === 0xa3) ||
          headerBuf.toString('utf8', 0, 128).includes('webm')) {
        contentType = 'video/webm';
      } else {
        contentType = 'video/mp4';
      }
    } catch (e) {
      contentType = 'video/mp4';
    }
  }

  // Always set universal CORS headers directly
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');

  if (fileSize === 0) {
    res.setHeader('Content-Length', '0');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    return res.status(200).send();
  }

  // Handle HEAD requests gracefully without triggering LiteSpeed proxy buffer limit
  if (req.method === 'HEAD') {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', fileSize);
    return res.status(200).end();
  }

  // For video streaming, ALWAYS use 206 Partial Content in safe chunks (max 10MB per burst)
  // This guarantees LiteSpeed never encounters an 800MB+ monolithic response and never throws 413
  let start = 0;
  let end = fileSize - 1;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || start >= fileSize) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      return res.status(416).send(`Requested range not satisfiable\n${start} >= ${fileSize}`);
    }

    if (end >= fileSize) {
      end = fileSize - 1;
    }
  } else {
    // If client sends no Range header (initial probe), send the initial 2MB chunk
    // This allows browser to read video metadata (moov atom) immediately without server buffer overflow
    const INITIAL_CHUNK = 2 * 1024 * 1024;
    end = Math.min(fileSize - 1, INITIAL_CHUNK - 1);
  }

  // Cap chunk size to maximum 10MB to guarantee instant start and zero proxy buffer drops
  const MAX_CHUNK = 10 * 1024 * 1024;
  if ((end - start) + 1 > MAX_CHUNK) {
    end = start + MAX_CHUNK - 1;
  }

  const chunksize = (end - start) + 1;
  const file = fs.createReadStream(resolvedPath, { start, end });
  
  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=86400'
  });

  file.pipe(res);
};

// High-speed Range-streaming for Live Recordings
app.all('/api/uploads/recordings/:filename', (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
    return res.status(200).end();
  }
  const filePath = path.join(__dirname, 'uploads', 'recordings', req.params.filename);
  streamVideoFile(filePath, req, res);
});

// High-speed Range-streaming for Syllabus Videos
app.all('/api/uploads/syllabus/:category/:filename', (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
    return res.status(200).end();
  }
  const filePath = path.join(__dirname, 'uploads', 'syllabus', req.params.category, req.params.filename);
  streamVideoFile(filePath, req, res);
});

// Serve other static files (images, pdfs)
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

// Global error handling middleware with guaranteed CORS headers
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
  
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 400 : 500);
  const message = err.code === 'LIMIT_FILE_SIZE' 
    ? 'File exceeds the maximum upload limit (1 GB). Please compress or trim the video.' 
    : (err.message || 'Server error occurred');
    
  res.status(status).json({ error: message });
});

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

    // 2. Explicitly ensure User table exists and seed Admin & Host with bcrypt hashing if empty
    try {
      await User.sync();
      const userCount = await User.count();
      if (userCount === 0) {
        console.log('🌱 Creating initial Admin & Host in MySQL users table with bcrypt hashed passwords...');
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@tarot.com').toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
        const hostEmail = (process.env.HOST_EMAIL || 'host@tarot.com').toLowerCase();
        const hostPassword = process.env.HOST_PASSWORD || 'hostpassword';

        const hashedAdmin = await bcrypt.hash(adminPassword, 10);
        const hashedHost = await bcrypt.hash(hostPassword, 10);

        await User.bulkCreate([
          {
            name: 'Sara Tarot Admin',
            email: adminEmail,
            password: hashedAdmin,
            role: 'admin'
          },
          {
            name: 'Sara Tarot Host',
            email: hostEmail,
            password: hashedHost,
            role: 'host'
          }
        ]);
        console.log('✅ Admin and Host accounts created with secure bcrypt hashing in users table');
      }
    } catch (userErr) {
      console.warn('User table sync/seed notice:', userErr.message);
    }

    // 3. General sync (safe fallback)
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

// Start Server with extended timeouts for large 1GB+ video uploads
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await syncAndSeed();
});

server.timeout = 7200000; // 2 hours
server.keepAliveTimeout = 7200000;
server.headersTimeout = 7205000;
server.requestTimeout = 7200000;
