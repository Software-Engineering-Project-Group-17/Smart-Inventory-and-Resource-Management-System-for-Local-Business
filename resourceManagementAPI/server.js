require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const resourceRoutes = require('./routes/resourceRoutes');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const { checkMaintenanceAlerts } = require('./services/maintenanceService');


const app = express();
app.use(express.json());

// ⏺️ Log incoming requests
app.use(logger);

// 🔗 Mount routes
app.use('/api/resources', resourceRoutes);

// 🧯 Centralized error handler (after routes)
app.use(errorHandler);

// 🚀 Start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch(err => {
    console.error('❌ DB Connection Error:', err);
    process.exit(1); // Don't hang silently
  });
