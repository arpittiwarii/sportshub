const bcrypt = require('bcryptjs');
const { config } = require('./src/env');
const { connectDB, mongoose } = require('./src/config/db');
const { User } = require('./src/models/user.model');

// Admin credentials come exclusively from the environment. The seed refuses to
// run with baked-in defaults so a well-known password can never reach an
// environment by accident.
const seedAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || '';
  const name = (process.env.ADMIN_NAME || 'Super Admin').trim();
  const contact = (process.env.ADMIN_CONTACT || '0000000000').trim();

  if (!email || !password) {
    console.error('Refusing to seed: set ADMIN_EMAIL and ADMIN_PASSWORD in the environment first.');
    process.exit(1);
  }

  const strongEnough = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  if (!strongEnough) {
    console.error('Refusing to seed: ADMIN_PASSWORD must be at least 8 characters and include both letters and numbers.');
    process.exit(1);
  }

  try {
    await connectDB();

    const adminExists = await User.findOne({ email });
    if (adminExists) {
      console.log(`Admin already exists for ${email} — no changes made.`);
    } else {
      await User.create({
        name,
        email,
        password: await bcrypt.hash(password, config.auth.passwordSaltRounds),
        role: 'ADMIN',
        age: 21,
        sports: 'Shot Put',
        status: 'APPROVED',
        contact,
      });
      console.log(`Admin user created for ${email}.`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
