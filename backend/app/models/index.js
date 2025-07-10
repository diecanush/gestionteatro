const dbConfig = require('../config/db.config.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        port: dbConfig.port,
        pool: dbConfig.pool,
        logging: false,
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.workshops = require('./workshop.model.js')(sequelize, DataTypes);
db.students = require('./student.model.js')(sequelize, DataTypes);

// Relationships: A workshop has many students.
db.workshops.hasMany(db.students, { 
  as: 'students',
  foreignKey: {
    name: 'workshopId',
    allowNull: false
  },
  onDelete: 'CASCADE' 
});

db.students.belongsTo(db.workshops, {
  foreignKey: 'workshopId',
  as: 'workshop',
});

module.exports = db;
