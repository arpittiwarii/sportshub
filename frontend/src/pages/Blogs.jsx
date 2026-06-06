import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiPlus, FiBookOpen } from 'react-icons/fi';

const truncate = (text, maxLen) => {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trim()}...`;
};

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const emptyForm = {
    id: null,
    title: '',
    content: '',
  };
  const fetchUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      setIsAdmin(user?.role === 'admin'); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load user.');
    }
  }
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get('/blogs');
        setBlogs(res.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load blogs.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser()

    fetchBlogs();
  }, []);

  if (loading) {
    return <div className="min-h-screen pt-24 bg-dark-900 text-center text-gray-400">Loading blogs...</div>;
  }

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    const title = form.title?.trim();
    const content = form.content?.trim();
    if (!title || !content) {
      toast.error('Title and content are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (form.id) {
        const res = await api.put(`/blogs/${form.id}`, { title, content });
        toast.success('Blog updated successfully!');
        setForm(emptyForm);
        setBlogs((prev) => prev.map((b) => (b._id === res.data._id ? res.data : b)));
      } else {
        const res = await api.post('/blogs', { title, content });
        toast.success('Blog created successfully!');
        setForm(emptyForm);
        setBlogs((prev) => [res.data, ...prev]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save blog.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (blog) => {
    setForm({
      id: blog._id,
      title: blog.title || '',
      content: blog.content || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Blog deleted successfully.');
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      if (form.id === id) setForm(emptyForm);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete blog.');
    }
  };


  return (
    <div className="min-h-screen pt-24 pb-16 bg-dark-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">Blogs</h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <FiBookOpen className="text-primary" /> Updates, tips, and training insights.
          </p>
        </div>

        {isAdmin && (<motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-6 md:p-10"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FiBookOpen className="text-primary" />
            {form.id ? 'Edit Blog' : 'Create Blog'}
          </h2>

          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-dark-900 border border-dark-700 text-white rounded-xl px-4 py-3 transition-colors"
                placeholder="e.g., Sprint Training Tips"
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2" htmlFor="content">
                Content
              </label>
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                className="w-full min-h-36 bg-dark-900 border border-dark-700 text-white rounded-xl px-4 py-3 transition-colors"
                placeholder="Write your blog post..."
                disabled={submitting}
                required
              />
            </div>

            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : form.id ? <FiEdit2 /> : <FiPlus />}
                {form.id ? 'Update Blog' : 'Create Blog'}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setForm(emptyForm)}
                className="flex-1 border border-dark-700 text-gray-300 hover:text-white hover:border-dark-600 px-6 py-3 rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
        )}

        {blogs.length === 0 ? (
          <div className="border border-dark-700 rounded-2xl bg-dark-800/30 p-10 text-center">
            <p className="text-gray-400">No blogs published yet.</p>
          </div>
        ) : (
          <div>
          <h2 className="text-xl font-bold text-white mb-4">Existing Posts</h2>
          {loading ? (
            <div className="text-center text-gray-400 py-10">Loading...</div>
          ) : blogs.length === 0 ? (
            <div className="text-center text-gray-400 py-10 border border-dark-700 rounded-2xl bg-dark-800/30">
              No blogs yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map((blog) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-dark-800/30 border border-dark-700 hover:border-primary/40 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-white truncate">{blog.title}</h3>
                    {isAdmin && (<div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(blog)}
                        className="px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary border border-primary/30 transition-colors"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(blog._id)}
                        className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/15 text-red-300 border border-red-500/30 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>)
                    }
                  </div>

                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                    {blog.content?.slice(0, 160) ? `${blog.content.slice(0, 160)}...` : blog.content}
                  </p>

                  <p className="text-gray-500 text-xs mt-4">
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '—'}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;

