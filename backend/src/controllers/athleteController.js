const User = require('../models/user.model');

const allowedSports = [
  'Shot Put',
  'Long Jump',
  'High Jump',
  'Running 100m',
  'Running 400m',
  'Running 800m',
  'Running 1600m',
  'Other',
];

const { uploadBufferToCloudinary } = require('../services/cloudinaryUpload');

// @desc    Get all athletes
// @route   GET /api/athletes
// @access  Private
const getAllAthletes = async (req, res) => {
  try {
    const athletes = await User.find({ role: 'athlete' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(athletes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get athlete by ID
// @route   GET /api/athletes/:id
// @access  Public (for viewing own reg)
const getAthleteById = async (req, res) => {
  try {
    const athlete = await User.findById(req.params.id).select('-password');
    if (!athlete || athlete.role !== 'athlete') {
      return res.status(404).json({ message: 'Athlete not found' });
    }
    res.status(200).json(athlete);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update athlete profile
// @route   PUT /api/athletes/:id
// @access  Public (athlete updates their info)
const updateAthlete = async (req, res) => {
  try {
    const { name, age, sport, contact, schoolName } = req.body;

    let athlete = await User.findById(req.params.id);

    if (!athlete || athlete.role !== 'athlete') {
      return res.status(404).json({ message: 'Athlete not found' });
    }

    athlete.name = name || athlete.name;
    athlete.age = age || athlete.age;
    if (sport) {
      let sportValue = sport;
      if (Array.isArray(sportValue)) sportValue = sportValue[0];
      if (typeof sportValue === 'string' && sportValue.includes(',')) {
        sportValue = sportValue.split(',')[0];
      }
      sportValue = String(sportValue).trim();

      if (!allowedSports.includes(sportValue)) {
        return res.status(400).json({ message: 'Invalid sport value' });
      }
      athlete.sport = sportValue;
    }
    athlete.contact = contact || athlete.contact;
    athlete.schoolName = schoolName || athlete.schoolName;

    const updatedAthlete = await athlete.save();

    // Convert to object and strip password for sending to client
    const returnObj = updatedAthlete.toObject();
    delete returnObj.password;

    res.status(200).json(returnObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete athlete profile
// @route   DELETE /api/athletes/:id
// @access  Private (Admin only)
const deleteAthlete = async (req, res) => {
  try {
    const athlete = await User.findById(req.params.id);

    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Athlete removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update athlete status (approve/reject)
// @route   PUT /api/athletes/:id/status
// @access  Private (Admin only)
const updateAthleteStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    let athlete = await User.findById(req.params.id);

    if (!athlete || athlete.role !== 'athlete') {
      return res.status(404).json({ message: 'Athlete not found' });
    }

    athlete.status = status;
    const updatedAthlete = await athlete.save();

    res.status(200).json({
      _id: updatedAthlete._id,
      name: updatedAthlete.name,
      status: updatedAthlete.status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllAthletes,
  getAthleteById,
  updateAthlete,
  deleteAthlete,
  updateAthleteStatus
};
