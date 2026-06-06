const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  role: {
    type: String,
    enum: ['admin', 'athlete'],
    default: 'athlete'
  },
  
  // Athlete specific fields
  age: { 
    type: Number, 
    min: [5, 'Age must be at least 5'],
    max: [60, 'Age cannot exceed 60']
  },
  sport: {
    type: String,
    validate: {
      validator: function (s) {
        const allowed = [
          'Shot Put',
          'Long Jump',
          'High Jump',
          'Running 100m',
          'Running 400m',
          'Running 800m',
          'Running 1600m',
          'Other',
        ];
        return !s || allowed.includes(s);
      },
      message: 'Invalid sport value',
    },
  },
  contact: String,
  aadhar: String,
  birthCertificate: {
    type: String,
    required: function () {
      return this.role === 'athlete';
    },
  },
  aadharCard: {
    type: String,
    required: function () {
      return this.role === 'athlete';
    },
  },
  afiId: {
    type: String,
    required: function () {
      return this.role === 'athlete';
    },
  },
  profileImage: String,
  schoolName: String,
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' // Admin isn't pending, we'll manually set it when seeding
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
