const { User } = require('./user.model')
const { Blog } = require('./blog.model')
const { Payment } = require('./payment.model')

User.hasOne(Blog, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
})
Blog.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
})

User.hasOne(Payment, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
})
Payment.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
})