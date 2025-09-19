const { Model, DataTypes } = require("sequelize");

module.exports = class SettingString extends Model {
    static init(sequelize) {
        return super.init({
            value: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            }
        }, {
            tableName: "SettingString",
            createdAt: false,
            updatedAt: false,
            sequelize
        });
    }
}