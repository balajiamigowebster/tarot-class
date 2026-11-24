const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'recordings');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname ? file.originalname.replace(/[^a-zA-Z0-9.]/g, '_') : '';
    let ext = path.extname(cleanName).toLowerCase();
    if (!ext) {
      if (file.mimetype === 'video/webm') ext = '.webm';
      else if (file.mimetype === 'image/jpeg') ext = '.jpg';
      else if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype?.startsWith('image/')) ext = '.jpg';
      else ext = '.mp4';
    }
    cb(null, `recording-${Date.now()}-${Math.round(Math.random() * 1E6)}${ext}`);
  }
});

const recordingUpload = multer({
  storage,
  limits: {
    fileSize: 1536 * 1024 * 1024 // 1.5 GB (1536 MB) max for video recordings
  }
});

module.exports = recordingUpload;

