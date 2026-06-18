const { Router } = require('express')
const athleteRoutes = require('./athleteRoutes');
const authRoutes = require('./authRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');
const blogRoutes = require('./blogRoutes');
const routes = Router();

// Routes
routes.use('/athlete', athleteRoutes);
routes.use('/admin', adminRoutes);
routes.use('/auth', authRoutes);
routes.use('/payments', paymentRoutes);
routes.use('/blogs', blogRoutes);

module.exports = { routes }