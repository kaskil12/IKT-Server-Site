const { Model, DataTypes } = require("sequelize");

module.exports = class Switcher extends Model {
    static init(sequelize) {
        return super.init({
            modell: {
                type: DataTypes.STRING,
                allowNull: false
            },
            ip: {
                type: DataTypes.STRING,
                allowNull: false
            },
            lokasjon: {
                type: DataTypes.STRING,
                allowNull: false
            },
            rack: {
                type: DataTypes.STRING,
                allowNull: false
            },
            trafikkMengde: {
                type: DataTypes.JSON,
                allowNull: true
            },
            online: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            oids: {
                type: DataTypes.JSON,
                allowNull: true
            },
            port: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            speedOid: {
                type: DataTypes.STRING,
                allowNull: true
            },
            community: {
                type: DataTypes.STRING,
                defaultValue: "public",
                allowNull: false
            },
            monitor: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }

        }, {
            tableName: "Switcher",
            createdAt: false,
            updatedAt: false,
            sequelize
        });
    }
}