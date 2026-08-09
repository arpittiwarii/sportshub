const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { config } = require('./env');

const { connectDB } = require('./config/db');
const { verifyCloudinaryConnection } = require('./config/cloudinary');
const { routes } = require('./routes/index');
require('./models/index');
const errorHandler = require('./middleware/errorHandler');
const paymentReminderJob = require('./jobs/paymentReminder');

const app = express();
const PORT = config.app.port;
const isProduction = config.nodeEnv === 'production';
const allowedOrigins = config.app.frontendUrls;
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (!isProduction && /^http:\/\/localhost:(5173|3000|4173)($|\/)/.test(origin)) {
    return true;
  }
  return false;
};

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'AUTH_RATE_LIMIT_EXCEEDED', message: 'Too many authentication attempts, please try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isProduction ? 5 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 'OTP_RATE_LIMIT_EXCEEDED', message: 'Too many OTP requests, please try again later.' },
});

paymentReminderJob();

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isProduction ? undefined : false,
  noSniff: true,
  xFrameOptions: { action: 'deny' },
  hsts: isProduction,
}));

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.options(/^(.*)$/, cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { index: false, redirect: false }));

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/otps', otpLimiter);
app.use('/api', defaultLimiter, routes);
app.use(errorHandler);

const verifyEmailConnection = () => new Promise((resolve, reject) => {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  transporter.verify((error) => {
    if (error) {
      reject(new Error(`Email service check failed: ${error.message}`));
      return;
    }
    resolve(true);
  });
});

const verifyRedisConnection = () => new Promise((resolve, reject) => {
  const net = require('net');
  const socket = net.createConnection({ host: config.redis.host, port: config.redis.port });

  socket.on('connect', () => {
    socket.end();
    resolve(true);
  });

  socket.on('error', (error) => {
    reject(new Error(`Redis service check failed: ${error.message}`));
  });
});

Promise.resolve()
  .then(() => connectDB())
  .then(() => verifyCloudinaryConnection())
  .then(() => verifyEmailConnection())
  .then(() => verifyRedisConnection())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Internal error: something went wrong', err);
    process.exit(1);
  });


