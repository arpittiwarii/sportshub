const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('../config/db')

const Payment = sequelize.define("payments",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            reference: {
                Model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        amount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            min: 0,
        },
        status: {
            type: DataTypes.ENUM("PENDING", "APPROVED", "REJECT"),
            defaultValue: "PENDING",
        },
        submitedAt: {
            type: DataTypes.DATE,
            defaultValue: new Date()
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        paranoid: true
    }
)

module.exports = { Payment }