const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('../config/db')

const Blog = sequelize.define("blogs",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            reference: {
                model: 'users',
                key: "id"
            },
            allowNull: false,
            onDelete: 'CASCADE'
        }
    }, {
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
}
)

module.exports = { Blog }