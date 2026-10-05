const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const SyllabusCategory = require('./SyllabusCategory');

const SyllabusImage = sequelize.define('SyllabusImage', {
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
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  subcategory: {
    type: DataTypes.ENUM('major', 'minor'),
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'syllabus_images',
  timestamps: true
});

SyllabusCategory.hasMany(SyllabusImage, { foreignKey: 'category_id', as: 'images', onDelete: 'CASCADE' });
SyllabusImage.belongsTo(SyllabusCategory, { foreignKey: 'category_id' });

module.exports = SyllabusImage;
