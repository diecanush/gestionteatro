
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Show = sequelize.define('Show', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  producer: {
    type: DataTypes.STRING,
  },
  date: {
    type: DataTypes.DATE,
  },
  time: {
    type: DataTypes.TIME,
  },
  hasBar: {
    type: DataTypes.BOOLEAN,
  },
  capacity: {
    type: DataTypes.INTEGER,
  },
  availableSeats: {
    type: DataTypes.INTEGER,
  },
  posterUrl: {
    type: DataTypes.STRING,
  },
  promoText: {
    type: DataTypes.STRING,
  },
  doorPrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
  advancePrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
  hasPromo: {
    type: DataTypes.BOOLEAN,
  },
  promoName: {
    type: DataTypes.STRING,
  },
  promoPrice: {
    type: DataTypes.DECIMAL(10, 2),
  },
}, {
  timestamps: false
});

export default Show;
