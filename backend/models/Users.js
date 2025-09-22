const { Model, DataTypes } = require("sequelize");

module.exports = class Users extends Model {
    static init(sequelize) {
        return super.init({
            username: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        }, {
            tableName: "Users",
            createdAt: false,
            updatedAt: false,
            sequelize
        });
    }
}