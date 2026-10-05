const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const SyllabusCategory = require('./SyllabusCategory');

const SyllabusVideo = sequelize.define('SyllabusVideo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SyllabusCategory,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnail_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subcategory: {
    type: DataTypes.ENUM('major', 'minor'),
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'syllabus_videos',
  timestamps: true
});

SyllabusCategory.hasMany(SyllabusVideo, { foreignKey: 'category_id', as: 'videos', onDelete: 'CASCADE' });
SyllabusVideo.belongsTo(SyllabusCategory, { foreignKey: 'category_id' });

module.exports = SyllabusVideo;
