const { Model, DataTypes } = require("sequelize");

module.exports = class TrafficHistory extends Model {
    static init(sequelize) {
        return super.init({
            switcherId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            incoming: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            outgoing: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            totaltraffic: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        }, {
            tableName: "TrafficHistory",
            createdAt: false,
            updatedAt: false,
            sequelize
        });
    }
}
