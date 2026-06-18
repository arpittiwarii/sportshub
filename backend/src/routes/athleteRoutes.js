const express = require('express');
const router = express.Router();
const {
  createAthlete,
  getAllAthletes,
  getAthleteById,
  updateAthlete,
  deleteAthlete,
  updateAthleteStatus
} = require('../controllers/athleteController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/studentDocsUpload');
const { uploadStudentDocuments } = require('../controllers/studentDocumentController');
const { upload: profileImageUpload } = require('../middleware/profileImageUpload');
const { updateAthleteProfileImage } = require('../controllers/athleteProfileController');

// Public route for registering
router.post(
  '/',
  upload.fields([
    { name: 'aadharCard', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
  ]),
  createAthlete
);

// Protected routes for Athlete & Admin to view/update profile
router.get('/:id', protect, getAthleteById);
router.put('/:id', protect, updateAthlete);

// Athlete self profile image
router.put(
  '/:id/profile-image',
  protect,
  restrictTo('athlete'),
  profileImageUpload.single('profileImage'),
  updateAthleteProfileImage
);

// Upload athlete documents (Cloudinary-backed)
router.put(
  '/:id/documents',
  protect,
  restrictTo('athlete'),
  upload.fields([
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
  ]),
  uploadStudentDocuments
);

// Protected routes for Admin only
router.get('/', protect, restrictTo('admin'), getAllAthletes);
router.delete('/:id', protect, restrictTo('admin'), deleteAthlete);
router.put('/:id/status', protect, restrictTo('admin'), updateAthleteStatus);

module.exports = router;
