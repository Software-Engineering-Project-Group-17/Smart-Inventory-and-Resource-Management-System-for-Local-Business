require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const resourceRoutes = require('./routes/resourceRoutes');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(logger);

app.use('/api/resources', resourceRoutes);

app.use(errorHandler);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error('❌ DB Connection Error:', err);
    process.exit(1);
  }
})();
