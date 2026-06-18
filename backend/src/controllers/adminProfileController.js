const User = require('../models/user.model');
const cloudinary = require('../config/cloudinary');
const { PassThrough } = require('stream');

const uploadToCloudinary = (buffer, { folder, publicId }) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const bufferStream = new PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });

// @desc  Get admin profile
// @route GET /api/admin/profile
// @access Private (admin)
const getAdminProfile = async (req, res) => {
  try {
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      profileImage: req.user.profileImage || '',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Update admin profile image (and optionally name/email)
// @route PUT /api/admin/profile
// @access Private (admin)
const updateAdminProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'profileImage file is required.' });
    }

    const { name, email } = req.body;
    const adminId = req.user._id;

    const folder = `sports-hub/admin-profiles/${adminId.toString()}`;
    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      publicId: 'profileImage',
    });

    const updated = await User.findByIdAndUpdate(
      adminId,
      {
        name: name || req.user.name,
        email: email || req.user.email,
        profileImage: result.secure_url,
      },
      { new: true }
    ).select('-password');

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Upload a student's profile image (admin only)
// @route PUT /api/admin/students/:id/profile-image
// @access Private (admin)
const updateStudentProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'profileImage file is required.' });
    }

    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== 'athlete') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const folder = `sports-hub/students/${studentId.toString()}`;
    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      publicId: 'profileImage',
    });

    student.profileImage = result.secure_url;
    await student.save();

    res.status(200).json({ message: 'Student profile image updated successfully.', profileImage: student.profileImage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAdminProfile, updateAdminProfile, updateStudentProfileImage };

