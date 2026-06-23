const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Fee = sequelize.define('fees', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    },

    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    month: {
        type: DataTypes.STRING
    },
    year: {
        type: DataTypes.INTEGER,
    },
    screenshot: {
        type: DataTypes.STRING
    },


    status: {
        type: DataTypes.ENUM(
            'PENDING',
            'APPROVED',
            'REJECT'
        ),
        defaultValue: 'PENDING'
    },

    submittedAt: {
        type: DataTypes.DATE,
        defaultValue: null
    }
}, {
    freezeTableName: true,
    timestamps: true,
    paranoid: true
});

module.exports = { Fee }