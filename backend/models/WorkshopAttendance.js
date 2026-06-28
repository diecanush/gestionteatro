import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WorkshopAttendance = sequelize.define('WorkshopAttendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  workshop_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('P', 'A'),
    allowNull: false,
    defaultValue: 'A',
    comment: 'P = Presente, A = Ausente',
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'workshop_attendance',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['workshop_id', 'student_id', 'date'],
    },
  ],
});

export default WorkshopAttendance;
