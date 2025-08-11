
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('onirico_sur_db', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mariadb',
  timezone: '+00:00', // Use UTC timezone
  dialectOptions: {
    useUTC: false, // for reading from database
    dateStrings: true,
    typeCast: true,
    timezone: '+00:00'
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;
