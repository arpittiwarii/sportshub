const User = require('../models/user.model');
const { uploadBufferToCloudinary } = require('../services/cloudinaryUpload');

// @desc   Upload student documents to Cloudinary
// @route  PUT /api/athletes/:id/documents
// @access Private (athlete only - uploads their own docs)
const uploadStudentDocuments = async (req, res) => {
  try {
    const athleteId = req.params.id;

    if (req.user._id.toString() !== athleteId.toString()) {
      return res.status(403).json({ message: 'Not authorized to upload documents for this athlete.' });
    }

    if (!req.body?.afiId) {
      return res.status(400).json({ message: 'AFI ID is required.' });
    }

    const afiId = String(req.body.afiId).trim();
    if (!afiId) {
      return res.status(400).json({ message: 'AFI ID is required.' });
    }

    const files = req.files || {};
    const aadharCardFile = files?.aadharCard?.[0];
    const birthCertificateFile = files?.birthCertificate?.[0];

    if (!aadharCardFile) {
      return res.status(400).json({ message: 'Aadhar Card file is required.' });
    }

    if (!birthCertificateFile) {
      return res.status(400).json({ message: 'Birth Certificate file is required.' });
    }

    const folder = `sports-hub/students/${athleteId}`;
    const updates = {};

    const birthResult = await uploadBufferToCloudinary(birthCertificateFile.buffer, {
      folder,
      publicId: 'birthCertificate',
    });
    updates.birthCertificate = birthResult.secure_url;

    const aadharResult = await uploadBufferToCloudinary(aadharCardFile.buffer, {
      folder,
      publicId: 'aadharCard',
    });
    updates.aadharCard = aadharResult.secure_url;

    updates.afiId = afiId;

    const athlete = await User.findByIdAndUpdate(athleteId, updates, { new: true }).select('-password');
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' });

    res.status(200).json(athlete);
  } catch (error) {
    // Multer will throw upload errors before we reach here; keep this generic for Cloudinary failures.
    res.status(500).json({ message: 'Document upload failed', error: error.message });
  }
};

module.exports = { uploadStudentDocuments };

