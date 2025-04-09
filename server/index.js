const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const citizenRoutes = require('./routes/citizen');
const rescueRoutes = require('./routes/rescue');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected 🚀'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);            // Authentication routes (register, login)
app.use('/api', protectedRoutes);            // Test protected route
app.use('/api/citizen', citizenRoutes);      // Citizen routes (report incidents)
app.use('/api/rescue', rescueRoutes);        // Rescue routes (view & update incidents)

// Root route
app.get('/', (req, res) => res.send('Server is running 🚀'));

// Start the server
app.listen(5000, () => console.log('Server started on port 5000'));
