const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Config for Video Uploads
const videoDir = path.join(__dirname, '../uploads/videos/');
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, videoDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
}); 
const uploadVideo = multer({ 
  storage: videoStorage,
  limits: { fileSize: 5000 * 1024 * 1024 } // 5GB limit
});

// Multer Config for Material Uploads
const materialDir = path.join(__dirname, '../uploads/materials/');
if (!fs.existsSync(materialDir)) {
  fs.mkdirSync(materialDir, { recursive: true });
}

const materialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, materialDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadMaterial = multer({ 
  storage: materialStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for PDFs
});

// Get all course content
router.get('/', contentController.getCourseContent);

const chunkUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Video CRUD
router.post('/video', uploadVideo.array('video_file', 10), contentController.addVideo);
router.put('/video/:id', uploadVideo.single('video_file'), contentController.updateVideo);
router.delete('/video/:id', contentController.deleteVideo);
router.post('/upload-chunk', chunkUpload.single('chunk'), contentController.uploadChunk);

// Material (PDF) CRUD
router.post('/material', uploadMaterial.single('material_file'), contentController.addMaterial);
router.put('/material/:id', uploadMaterial.single('material_file'), contentController.updateMaterial);
router.delete('/material/:id', contentController.deleteMaterial);

module.exports = router;
