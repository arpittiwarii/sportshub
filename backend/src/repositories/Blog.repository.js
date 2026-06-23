const { Blog } = require('../models/blog.model');

async function findAllBlogs() {
    return await Blog.findAll({ order: [['createdAt', 'DESC']] });
}

async function findById(id) {
    return await Blog.findByPk(id);
}

async function createBlog(data) {
    return await Blog.create(data);
}

async function updateBlog(id, updates) {
    const blog = await Blog.findByPk(id);
    if (!blog) return null;
    await blog.update(updates);
    return await Blog.findByPk(id);
}

async function deleteBlog(id) {
    const blog = await Blog.findByPk(id);
    if (!blog) return null;
    await blog.destroy();
    return true;
}

module.exports = { findAllBlogs, findById, createBlog, updateBlog, deleteBlog };
