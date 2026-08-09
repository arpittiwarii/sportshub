const jwt = require('jsonwebtoken');
const { config } = require('../env');
const { findUserById } = require('../repositories/User.repository');

const getJwtSecret = () => {
  const secret = config.auth.jwtSecret;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await findUserById(decoded.id);

    if (!user || user.deletedAt) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: String(user.role || '').toUpperCase(),
      status: String(user.status || '').toUpperCase(),
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const allowedRoles = roles.map((role) => String(role).toUpperCase());
    if (!req.user || !allowedRoles.includes(String(req.user.role).toUpperCase())) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    return next();
  };
};

const requireOwnershipOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const requestedId = String(req.params[paramName] || '');
    const userId = String(req.user.id || '');

    if (req.user.role === 'ADMIN' || userId === requestedId) {
      return next();
    }

    return res.status(403).json({ message: 'You do not have permission to access this resource' });
  };
};

module.exports = { protect, restrictTo, requireOwnershipOrAdmin };
