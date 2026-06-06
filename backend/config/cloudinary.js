const cloudinary = require('cloudinary').v2;

const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  // Warn instead of crashing so the server can still run without uploads configured.
  // Upload endpoints will fail with a clear Cloudinary error when invoked.
  // eslint-disable-next-line no-console
  console.warn(`Cloudinary env vars missing: ${missing.join(', ')}`);
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

module.exports = cloudinary;

