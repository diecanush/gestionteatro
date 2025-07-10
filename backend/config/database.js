
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('onirico_sur_db', 'root', '', {
  host: 'localhost',
  dialect: 'mariadb',
  timezone: '+00:00', // Use UTC timezone
  dialectOptions: {
    useUTC: false, // for reading from database
    dateStrings: true,
    typeCast: true,
    timezone: '+00:00'
  }
});

export default sequelize;
