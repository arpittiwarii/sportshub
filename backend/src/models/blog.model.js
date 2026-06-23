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
            type: DataTypes.TEXT,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            },
            allowNull: false,
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        }
    }, {
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
}
)

module.exports = { Blog }