
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Workshop = sequelize.define('Workshop', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  schedule: {
    type: DataTypes.STRING,
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  teacher: {
    type: DataTypes.STRING,
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
  },
}, {
  tableName: 'workshops',
  timestamps: false
});

export default Workshop;
