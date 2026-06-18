
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
// @desc    Register a new athlete
// @route   POST /api/athletes
// @access  Public
async function registerUser({ name, email, password, age, sport, contact, schoolName, afiId }) {
    try {

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

        const userExists = await findUserByEmail(email)
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

module.exports = { registerUser }