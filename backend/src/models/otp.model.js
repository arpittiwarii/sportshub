const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const OTP = sequelize.define('otps', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    UId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    otp: {
        type: DataTypes.STRING,
    },
}, {
    freezeTableName: true,
    timestamps: true,
    paranoid: true
});

module.exports = { OTP }