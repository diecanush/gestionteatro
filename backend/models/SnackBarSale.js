export default (sequelize, DataTypes) => {
    const SnackBarSale = sequelize.define("SnackBarSale", {
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['Efectivo', 'Transferencia', 'Tarjeta']]
            }
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


