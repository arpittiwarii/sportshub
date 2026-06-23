const express = require('express');
const router = express.Router();
const {
  getAllAthletes,
  getAthleteById,
  updateAthlete,
  deleteAthlete,
  updateAthleteStatus
} = require('../controllers/athleteController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/studentDocsUpload');
const { uploadStudentDocumentsController } = require('../controllers/studentDocumentController');
const { upload: profileImageUpload } = require('../middleware/profileImageUpload');
const { updateAthleteProfileImageController } = require('../controllers/athleteProfileController');



// Protected routes for Athlete & Admin to view/update profile
router.get('/:id', protect, getAthleteById);
router.put('/:id', protect, updateAthlete);

// Athlete self profile image
router.put(
  '/:id/profile-image',
  protect,
  restrictTo('ATHLETE'),
  profileImageUpload.single('profileImage'),
  updateAthleteProfileImageController
);

// Upload athlete documents (Cloudinary-backed)
router.put(
  '/:id/documents',
  protect,
  restrictTo('ATHLETE'),
  upload.fields([
    { name: 'birthCertificate', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
  ]),
  uploadStudentDocumentsController
);

// Protected routes for Admin only
router.get('/', protect, restrictTo('ADMIN'), getAllAthletes);
router.delete('/:id', protect, restrictTo('ADMIN'), deleteAthlete);
// router.put('/:id/status', protect, restrictTo('admin'), updateAthleteStatus);
router.put('/:id/status', updateAthleteStatus);
module.exports = router;
