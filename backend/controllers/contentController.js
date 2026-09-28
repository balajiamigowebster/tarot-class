const Course = require('../models/Course');
const CourseVideo = require('../models/CourseVideo');
const CourseMaterial = require('../models/CourseMaterial');
const fs = require('fs');
const path = require('path');

// Get all course content
exports.getCourseContent = async (req, res) => {
  try {
    const courseSlug = 'tarot-card-reading-classes';

    const course = await Course.findOne({
      where: { slug: courseSlug },
      include: [
        {
          model: CourseVideo,
          as: 'videos',
        },
        {
          model: CourseMaterial,
          as: 'materials',
        }
      ],
      order: [
        [{ model: CourseVideo, as: 'videos' }, 'lesson_number', 'ASC']
      ]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      success: true,
      data: {
        videos: course.videos,
        pdfs: course.materials
      }
    });

  } catch (error) {
    console.error('Error fetching course content:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// --- VIDEO CRUD ---

exports.addVideo = async (req, res) => {
  try {
    const { course_id, title, description, duration, lesson_number } = req.body;

    let finalCourseId = course_id;
    if (!finalCourseId) {
      const course = await Course.findOne();
      if (course) finalCourseId = course.id;
    }

    const createdVideos = [];

    // Handle multiple uploaded files
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const videoUrl = `${req.protocol}://${req.get('host')}/api/uploads/videos/${file.filename}`;
        
        const newVideo = await CourseVideo.create({
          course_id: finalCourseId || 1,
          // If arrays are passed for title/lesson_number, use them by index, otherwise fallback to string value or default
          lesson_number: (Array.isArray(lesson_number) ? lesson_number[i] : lesson_number) || (i + 1),
          title: (Array.isArray(title) ? title[i] : title) || `Video ${i + 1}`,
          description: Array.isArray(description) ? description[i] : description,
          video_url: videoUrl,
          duration: Array.isArray(duration) ? duration[i] : duration
        });
        createdVideos.push(newVideo);
      }
    } else if (req.body.video_url) {
      // Fallback for a single video URL submission
      const newVideo = await CourseVideo.create({
        course_id: finalCourseId || 1,
        lesson_number: lesson_number || 1,
        title,
        description,
        video_url: req.body.video_url,
        duration
      });
      createdVideos.push(newVideo);
    }

    res.json({ success: true, data: createdVideos });
  } catch (error) {
    console.error('Error adding video(s):', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, lesson_number } = req.body;

    const video = await CourseVideo.findByPk(id);
    if (!video) return res.status(404).json({ success: false, error: 'Video not found' });

    let videoUrl = video.video_url;
    if (req.file) {
      videoUrl = `${req.protocol}://${req.get('host')}/api/uploads/videos/${req.file.filename}`;
    } else if (req.body.video_url) {
      videoUrl = req.body.video_url;
    }

    await video.update({
      title: title !== undefined ? title : video.title,
      description: description !== undefined ? description : video.description,
      video_url: videoUrl,
      duration: duration !== undefined ? duration : video.duration,
      lesson_number: lesson_number !== undefined ? lesson_number : video.lesson_number
    });

    res.json({ success: true, data: video });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await CourseVideo.findByPk(id);

    if (!video) return res.status(404).json({ success: false, error: 'Video not found' });

    await video.destroy();
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.uploadChunk = async (req, res) => {
  try {
    const { chunkIndex, totalChunks, identifier, fileName } = req.body;
    const chunkFile = req.file;

    if (!chunkFile) {
      return res.status(400).json({ error: 'No chunk file provided' });
    }

    const tempDir = path.join(__dirname, '../uploads/videos/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, identifier);

    fs.appendFileSync(tempFilePath, chunkFile.buffer);

    const isLastChunk = parseInt(chunkIndex) === parseInt(totalChunks) - 1;

    if (isLastChunk) {
      const finalDir = path.join(__dirname, '../uploads/videos/');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(fileName);
      const finalFileName = 'video-' + uniqueSuffix + ext;
      const finalFilePath = path.join(finalDir, finalFileName);

      fs.renameSync(tempFilePath, finalFilePath);

      const videoUrl = `${req.protocol}://${req.get('host')}/api/uploads/videos/${finalFileName}`;
      
      return res.json({ success: true, completed: true, videoUrl });
    }

    res.json({ success: true, completed: false });
  } catch (error) {
    console.error('Error uploading chunk:', error);
    res.status(500).json({ success: false, error: 'Chunk upload failed' });
  }
};


// --- MATERIAL (PDF) CRUD ---

exports.addMaterial = async (req, res) => {
  try {
    const { course_id, title, description, file_size } = req.body;

    let fileUrl = req.body.file_url;
    if (req.file) {
      fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/materials/${req.file.filename}`;
    }

    let finalCourseId = course_id;
    if (!finalCourseId) {
      const course = await Course.findOne();
      if (course) finalCourseId = course.id;
    }

    const newMaterial = await CourseMaterial.create({
      course_id: finalCourseId || 1,
      title,
      description,
      file_url: fileUrl,
      file_size
    });

    res.json({ success: true, data: newMaterial });
  } catch (error) {
    console.error('Error adding material:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, file_size } = req.body;

    const material = await CourseMaterial.findByPk(id);
    if (!material) return res.status(404).json({ success: false, error: 'Material not found' });

    let fileUrl = material.file_url;
    if (req.file) {
      fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/materials/${req.file.filename}`;
    } else if (req.body.file_url) {
      fileUrl = req.body.file_url;
    }

    await material.update({
      title: title !== undefined ? title : material.title,
      description: description !== undefined ? description : material.description,
      file_url: fileUrl,
      file_size: file_size !== undefined ? file_size : material.file_size
    });

    res.json({ success: true, data: material });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await CourseMaterial.findByPk(id);

    if (!material) return res.status(404).json({ success: false, error: 'Material not found' });

    await material.destroy();
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
