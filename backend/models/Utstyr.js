const {Model, DataTypes} = require("sequelize");

module.exports = class Utstyr extends Model {
    static init(sequelize) {
        return super.init({
            name: {
                type: DataTypes.STRING, 
                defaultValue: "Tom"
            },
            code: {
                type: DataTypes.STRING,
                defaultValue: "Tom"
            },
            item: {
                type: DataTypes.STRING,
                defaultValue: "Tom"
            },
            utlånt: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            tableName: "Utstyr",
            createdAt: false,
            updatedAt: false,
            sequelize
        })
    }
}