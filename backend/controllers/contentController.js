const Course = require('../models/Course');
const fs = require('fs');
const path = require('path');

// Get all course content
exports.getCourseContent = async (req, res) => {
  try {
    const courseSlug = 'tarot-card-reading-classes';

    const course = await Course.findOne({
      where: { slug: courseSlug }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      success: true,
      data: {
        videos: [],
        pdfs: []
      }
    });

  } catch (error) {
    console.error('Error fetching course content:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

