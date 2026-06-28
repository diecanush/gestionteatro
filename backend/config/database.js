import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  name: process.env.DB_NAME || 'onirico_sur_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  timezone: process.env.DB_TIMEZONE || '+00:00',
};

let sequelize;

if (process.env.NODE_ENV === 'test') {
  // Use an in-memory SQLite database for tests
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
} else {
  sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    dialectModule: mysql2,
    timezone: dbConfig.timezone, // Use UTC timezone
    dialectOptions: {
      useUTC: false, // for reading from database
      dateStrings: true,
      typeCast: true,
      timezone: dbConfig.timezone,
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
}

export default sequelize;
