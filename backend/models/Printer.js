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
            PrinterIP: {
                type: DataTypes.STRING,
                defaultValue: "Tom"
            },
            plassering: {
                type: DataTypes.STRING,
                defaultValue: "Tom"
            },
            oids: {
                type: DataTypes.JSON,
                defaultValue: []
            },
            feilkode: {
                type: DataTypes.STRING,
                defaultValue: "Tom"
            },
            online: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
            {
                tableName: "Printer",
                createdAt: false,
                sequelize
            })
    }
}

//For later i want authentication