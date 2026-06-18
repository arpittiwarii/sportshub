const { sequelize } = require('../config/db')
const { DataTypes } = require('sequelize')

const User = sequelize.define("users",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                formate: "email"
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM("ATHLETE", "ADMIN", "COACH"),
            defaulValue: "ATHLETE"
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        sports: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        afiId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        aadhar: {
            type: DataTypes.STRING
        },
        school: {
            type: DataTypes.STRING,
        },
        profile: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.ENUM("PENDING", "APPROVED", "REJECT"),
            defaultValue: "PENDING"
        }
    },
    {
        defaultScope: {
            attributes: {
                exclude: ["password"],
            },
        },
        scopes: {
            withPassword: {
                attributes: {},
            },
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        paranoid: true
    }
)

module.exports = { User }