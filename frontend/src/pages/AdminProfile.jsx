import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FiUploadCloud } from 'react-icons/fi';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/profile');
        setProfile(res.data?.data || res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load profile.');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.warning('Please select a profile image.');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('profileImage', file);

      const res = await api.put('/admin/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile(res.data?.data || res.data);
      setFile(null);
      toast.success('Profile image updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen page-shell bg-bg text-center text-content-muted">Loading...</div>;
  }

  return (
    <div className="min-h-screen page-shell pb-16 bg-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-content">Admin Profile</h1>
          <p className="text-content-muted mt-2">View details and update profile image.</p>
        </div>

        <div className="glass-panel p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-border bg-surface-2">
              {profile?.profileImage ? (
                <img src={profile.profileImage} alt="Admin profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-content-subtle">No Image</div>
              )}
            </div>
            <div className="text-center mt-4">
              <p className="text-content font-bold text-lg">{profile?.name || 'N/A'}</p>
              <p className="text-content-muted text-sm mt-1">{profile?.email || 'N/A'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-content-muted font-medium mb-2" htmlFor="profileImage">
                Profile Image (JPG/PNG)
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  setFile(f || null);
                }}
                disabled={saving}
                className="w-full bg-surface-2 border border-border text-content rounded-xl px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiUploadCloud />
              {saving ? 'Uploading...' : 'Update Profile Image'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

