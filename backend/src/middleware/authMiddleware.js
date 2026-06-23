const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
      console.log(process.env.JWT_SECRET_KEY)
      const decoded = jwt.verify(token, secret);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });
      if (!user) {
        return res.status(401).json({ message: 'User not found in system' });
      }
      req.user = user;

      next();
    } catch (error) {
      console.error('JWT Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const allowedRoles = roles.map((role) => String(role).toUpperCase());
    if (!req.user || !allowedRoles.includes(String(req.user.role).toUpperCase())) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };