const { User } = require('./user.model')
const { Blog } = require('./blog.model')
const { Fee } = require('./fee.model')

User.hasMany(Blog, {
    foreignKey: 'userId'
})
Blog.belongsTo(User, {
    foreignKey: 'userId'
})

User.hasMany(Fee, {
    foreignKey: 'userId'
})
Fee.belongsTo(User, {
    foreignKey: 'userId'
})
