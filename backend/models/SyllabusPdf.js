const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const SyllabusCategory = require('./SyllabusCategory');

const SyllabusPdf = sequelize.define('SyllabusPdf', {
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
  pdf_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_size: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'syllabus_pdfs',
  timestamps: true
});

SyllabusCategory.hasMany(SyllabusPdf, { foreignKey: 'category_id', as: 'pdfs', onDelete: 'CASCADE' });
SyllabusPdf.belongsTo(SyllabusCategory, { foreignKey: 'category_id' });

module.exports = SyllabusPdf;
