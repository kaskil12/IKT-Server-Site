const {Model, DataTypes} = require("sequelize");

module.exports = class Liste extends Model {
    static init(sequelize) {
        return super.init({
            dato: {
                type: DataTypes.STRING, 
                defaultValue: "Tom"
            },
            antall: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            }
        },
        {
            tableName: "Liste",
            createdAt: false,
            updatedAt: false,
            sequelize
        })
    }
}