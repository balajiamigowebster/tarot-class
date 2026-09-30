const express = require('express');
const router = express.Router();
const studentSyncController = require('../controllers/studentSyncController');

// POST /api/save-student
router.post('/', studentSyncController.saveStudent);

module.exports = router;
