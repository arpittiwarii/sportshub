const Blog = require('../models/blog.model');

// @desc   Get all blogs
// @route  GET /api/blogs
// @access Public
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Create a blog post (admin only)
// @route  POST /api/blogs
// @access Private (admin)
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'title and content are required.' });
    }

    const blog = await Blog.create({ title, content });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Update a blog post (admin only)
// @route  PUT /api/blogs/:id
// @access Private (admin)
const updateBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'title and content are required.' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    blog.title = title;
    blog.content = content;
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Delete a blog post (admin only)
// @route  DELETE /api/blogs/:id
// @access Private (admin)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });
    res.status(200).json({ message: 'Blog deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBlogs, createBlog, updateBlog, deleteBlog };

