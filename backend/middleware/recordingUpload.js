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
    const ext = path.extname(cleanName) || (file.mimetype === 'video/webm' ? '.webm' : '.mp4');
    cb(null, `recording-${Date.now()}-${Math.round(Math.random() * 1E6)}${ext}`);
  }
});

const recordingUpload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1 GB (1024 MB) max for video recordings
  }
});

module.exports = recordingUpload;

