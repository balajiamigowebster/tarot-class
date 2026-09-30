const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');


// Get all course content
router.get('/', contentController.getCourseContent);

module.exports = router;
