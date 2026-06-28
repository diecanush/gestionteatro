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
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  classDays: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Días de clase en formato JSON: [0,2,4] para domingo,martes,jueves',
  },
  teacher: {
    type: DataTypes.STRING,
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
  },
}, {
  tableName: 'workshops',
  timestamps: false,
});

export default Workshop;
