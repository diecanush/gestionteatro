module.exports = (sequelize, DataTypes) => {
    const Workshop = sequelize.define('workshop', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        schedule: {
            type: DataTypes.STRING
        },
        startDate: {
            type: DataTypes.DATEONLY
        },
        endDate: {
            type: DataTypes.DATEONLY
        },
        teacher: {
            type: DataTypes.STRING
        },
        fee: {
            type: DataTypes.DECIMAL(10, 2)
        }
    });
    return Workshop;
};
