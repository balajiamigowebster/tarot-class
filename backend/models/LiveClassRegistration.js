const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LiveClassRegistration = sequelize.define('LiveClassRegistration', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  registeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'live_class_registrations',
  timestamps: false
});

module.exports = LiveClassRegistration;
