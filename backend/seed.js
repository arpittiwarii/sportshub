const bcrypt = require('bcryptjs');
const { config } = require('./src/env');
const { connectDB, mongoose } = require('./src/config/db');
const { User } = require('./src/models/user.model');

const seedAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const email = 'admin@sportshub.com';
    const adminExists = await User.findOne({ email });

    if (adminExists) {
      console.log('Admin already exists');
    } else {
      await User.create({
        name: 'Super Admin',
        email,
        password: await bcrypt.hash('password123', config.auth.passwordSaltRounds),
        role: 'ADMIN',
        age: 21,
        sports: 'Shot Put',
        status: 'APPROVED',
        contact: '7771007505',
      });

      console.log('Admin user created successfully');
    }

    console.log('Demo Admin Credentials:');
    console.log('Email: admin@sportshub.com');
    console.log('Password: password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
