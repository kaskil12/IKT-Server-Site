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
            oids: {
                type: DataTypes.JSON,
                defaultValue: {
                    black: "1.3.6.1.2.1.43.11.1.1.9.1.2"
                }
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