const User = require('../models/User');

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

// @desc    Register a new athlete
// @route   POST /api/athletes
// @access  Public
const createAthlete = async (req, res) => {
  try {
    const { name, email, password, age, sport, contact, schoolName, afiId } = req.body;

    const aadharCardFile = req.files?.aadharCard?.[0];
    const birthCertificateFile = req.files?.birthCertificate?.[0];

    if (!name || !email || !password || !age || !sport || !contact || !schoolName || !afiId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!allowedSports.includes(sport)) {
      return res.status(400).json({ message: 'Invalid sport value' });
    }

    if (!aadharCardFile) {
      return res.status(400).json({ message: 'Aadhar Card file is required.' });
    }

    if (!birthCertificateFile) {
      return res.status(400).json({ message: 'Birth Certificate file is required.' });
    }

    const normalizedAfiId = String(afiId).trim();
    if (!normalizedAfiId) {
      return res.status(400).json({ message: 'AFI ID is required.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Upload documents first so we can store URLs during user creation.
    const safeEmail = String(email).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const folder = `sports-hub/students/${safeEmail}`;
    const birthResult = await uploadBufferToCloudinary(birthCertificateFile.buffer, {
      folder,
      publicId: 'birthCertificate',
    });

    const aadharResult = await uploadBufferToCloudinary(aadharCardFile.buffer, {
      folder,
      publicId: 'aadharCard',
    });

    const athlete = new User({
      name,
      email,
      password,
      role: 'athlete',
      age,
      sport,
      contact,
      birthCertificate: birthResult.secure_url,
      aadharCard: aadharResult.secure_url,
      afiId: normalizedAfiId,
      schoolName
    });

    const createdAthlete = await athlete.save();
    
    res.status(201).json({
      _id: createdAthlete._id,
      name: createdAthlete.name,
      email: createdAthlete.email,
      role: createdAthlete.role,
      status: createdAthlete.status,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
  createAthlete,
  getAllAthletes,
  getAthleteById,
  updateAthlete,
  deleteAthlete,
  updateAthleteStatus
};
