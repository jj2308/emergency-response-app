const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const citizenRoutes = require('./routes/citizen');
const rescueRoutes = require('./routes/rescue');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected 🚀'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/rescue', rescueRoutes);

// Serve Frontend Build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Wildcard Route — Make sure this is **after** your API routes ✅
app.get('*', (req, res) => {
  console.log(`Serving frontend for: ${req.originalUrl}`);
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
