const SyllabusCategory = require('../models/SyllabusCategory');
const SyllabusVideo = require('../models/SyllabusVideo');
const SyllabusImage = require('../models/SyllabusImage');
const fs = require('fs');
const path = require('path');

exports.getCategories = async (req, res) => {
  try {
    const categories = await SyllabusCategory.findAll({
      order: [['id', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVideosByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const videos = await SyllabusVideo.findAll({
      where: { category_id: categoryId },
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addVideo = async (req, res) => {
  try {
    const { title, description, category_id, duration, order } = req.body;
    
    // Multer saves files, we construct the URL
    const categorySlug = req.body.categorySlug || 'uncategorized';
    
    let videoUrl = '';
    let thumbnailUrl = '';

    if (req.files) {
      if (req.files.video && req.files.video.length > 0) {
        videoUrl = `/api/uploads/syllabus/${categorySlug}/${req.files.video[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        thumbnailUrl = `/api/uploads/syllabus/${categorySlug}/${req.files.thumbnail[0].filename}`;
      }
    }

    const newVideo = await SyllabusVideo.create({
      category_id,
      title,
      description,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      duration,
      subcategory: req.body.subcategory || null,
      order: order || 0
    });

    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Add video error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration } = req.body;
    
    const video = await SyllabusVideo.findByPk(id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    const categorySlug = req.body.categorySlug || 'uncategorized';

    let videoUrl = video.video_url;
    let thumbnailUrl = video.thumbnail_url;

    if (req.files) {
      if (req.files.video && req.files.video.length > 0) {
        videoUrl = `/api/uploads/syllabus/${categorySlug}/${req.files.video[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail.length > 0) {
        thumbnailUrl = `/api/uploads/syllabus/${categorySlug}/${req.files.thumbnail[0].filename}`;
      }
    }

    video.title = title !== undefined ? title : video.title;
    video.description = description !== undefined ? description : video.description;
    video.duration = duration !== undefined ? duration : video.duration;
    video.video_url = videoUrl;
    video.thumbnail_url = thumbnailUrl;
    if (req.body.subcategory !== undefined) {
      video.subcategory = req.body.subcategory;
    }
    
    await video.save();
    res.json(video);
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await SyllabusVideo.findByPk(id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    await video.destroy();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getImagesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const images = await SyllabusImage.findAll({
      where: { category_id: categoryId },
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addImage = async (req, res) => {
  try {
    const { title, category_id, order } = req.body;
    const categorySlug = req.body.categorySlug || 'uncategorized';
    
    let imageUrl = '';
    if (req.file) {
       imageUrl = `/api/uploads/syllabus/${categorySlug}/${req.file.filename}`;
    } else {
       return res.status(400).json({ message: 'Image file is required' });
    }

    const newImage = await SyllabusImage.create({
      category_id,
      title,
      image_url: imageUrl,
      content: req.body.content || null,
      subcategory: req.body.subcategory || null,
      order: order || 0
    });

    res.status(201).json(newImage);
  } catch (error) {
    console.error("Add image error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const image = await SyllabusImage.findByPk(id);
    if (!image) return res.status(404).json({ message: 'Image not found' });
    
    const categorySlug = req.body.categorySlug || 'uncategorized';

    let imageUrl = image.image_url;
    if (req.file) {
      imageUrl = `/api/uploads/syllabus/${categorySlug}/${req.file.filename}`;
    }

    image.title = title !== undefined ? title : image.title;
    image.content = content !== undefined ? content : image.content;
    image.image_url = imageUrl;
    
    if (req.body.subcategory !== undefined) {
      image.subcategory = req.body.subcategory;
    }
    
    await image.save();
    res.json(image);
  } catch (error) {
    console.error("Update image error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await SyllabusImage.findByPk(id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    await image.destroy();
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const SyllabusPdf = require('../models/SyllabusPdf');

exports.getPdfsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const pdfs = await SyllabusPdf.findAll({
      where: { category_id: categoryId },
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addPdf = async (req, res) => {
  try {
    const { title, category_id, order, file_size } = req.body;
    const categorySlug = req.body.categorySlug || 'uncategorized';
    
    let pdfUrl = '';
    if (req.file) {
       pdfUrl = `/api/uploads/syllabus/${categorySlug}/${req.file.filename}`;
    } else {
       return res.status(400).json({ message: 'PDF file is required' });
    }

    const newPdf = await SyllabusPdf.create({
      category_id,
      title,
      pdf_url: pdfUrl,
      file_size,
      order: order || 0
    });

    res.status(201).json(newPdf);
  } catch (error) {
    console.error("Add PDF error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const pdf = await SyllabusPdf.findByPk(id);
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    await pdf.destroy();
    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
