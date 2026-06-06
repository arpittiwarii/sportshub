const User = require('../models/User');
const { uploadBufferToCloudinary } = require('../services/cloudinaryUpload');

// @desc  Athlete updates their own profile image
// @route PUT /api/athletes/:id/profile-image
// @access Private (athlete)
const updateAthleteProfileImage = async (req, res) => {
  try {
    const athleteId = req.params.id;

    if (req.user._id.toString() !== athleteId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile image.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'profileImage file is required.' });
    }

    const folder = `sports-hub/students/${athleteId.toString()}/profiles`;
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder,
      publicId: 'profileImage',
    });

    const updated = await User.findByIdAndUpdate(
      athleteId,
      { profileImage: result.secure_url },
      { new: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'Athlete not found.' });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { updateAthleteProfileImage };

