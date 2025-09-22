const { Model, DataTypes } = require("sequelize");

module.exports = class Switcher extends Model {
    static init(sequelize) {
        return super.init({
            name: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            ip: {
                type: DataTypes.STRING,
                allowNull: false
            },
            model: {
                type: DataTypes.STRING,
                allowNull: false
            },
            location: {
                type: DataTypes.STRING,
                allowNull: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, {
            tableName: "Switcher",
            createdAt: false,
            updatedAt: false,
            sequelize
        });
    }
}