const { Model, DataTypes } = require("sequelize");

module.exports = class Printer extends Model {
    static init(sequelize) {
        return super.init({
            modell: {
                type: DataTypes.STRING,
                defaultValue: "Tom"
            },
            serienummer: {
                type: DataTypes.STRING,
                defaultValue: "Tom"
            },
            plassering: {
                type: DataTypes.STRING,
                defaultValue: "Tom"
            },
            utlånt: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
            {
                tableName: "Printer",
                createdAt: false,
                updatedAt: false,
                sequelize
            })
    }
}