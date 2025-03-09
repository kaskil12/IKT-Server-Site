const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = class Account extends Model {
    static init(sequelize) {
        return super.init({
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                default: false
            }
        }, {
            tableName: "Account",
            createdAt: false,
            updatedAt: false,
            sequelize,
            hooks: {
                beforeCreate: async (account) => {
                    const saltRounds = 10;
                    account.password = await bcrypt.hash(account.password, saltRounds);
                }
            }
        });
    }

    static async createDefaultAdmin() {
        const adminExists = await this.findOne({ where: { name: "admin" } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("password", 10);
            await this.create({ name: "admin", password: hashedPassword });
            console.log("Default admin account created.");
        } else {
            console.log("Admin account already exists.");
        }
    }
};
