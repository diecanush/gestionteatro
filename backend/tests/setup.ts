import { Sequelize } from 'sequelize';

// SQLite in-memory database for tests
export const sequelize = new Sequelize('sqlite::memory:', {
  logging: false,
});

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

