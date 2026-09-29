const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LiveClass = sequelize.define('LiveClass', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  meetingUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  allowedEmails: {
    type: DataTypes.JSON, // Store as JSON array of emails
    allowNull: false,
    defaultValue: []
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'live_classes',
  timestamps: false
});

module.exports = LiveClass;
