export default (sequelize, DataTypes) => {
    const SnackBarSale = sequelize.define("SnackBarSale", {
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        saleDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    SnackBarSale.associate = models => {
        SnackBarSale.hasMany(models.SnackBarSaleItem, {
            foreignKey: 'saleId',
            as: 'items'
        });
    };

    return SnackBarSale;
};
