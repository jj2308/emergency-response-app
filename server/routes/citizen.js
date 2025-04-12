const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const Incident = require('../models/Incident');

const router = express.Router();

// Report Incident
router.post('/report-incident', verifyToken, authorizeRoles('citizen'), async (req, res) => {
  
  const { type, description, location } = req.body;

  try {
    const newIncident = new Incident({
      user: req.user.id,
      type,
      description,
      location
    });

    await newIncident.save();

    res.status(201).json({ message: "Incident reported successfully!", incidentId: newIncident._id });
  } catch (error) {
    res.status(500).json({ message: "Error reporting incident", error: error.message });
  }
});
// Get My Reports
router.get('/my-reports', verifyToken, authorizeRoles('citizen'), async (req, res) => {
    try {
      const incidents = await Incident.find({ user: req.user.id }).sort({ reportedAt: -1 });
  
      res.status(200).json({ incidents });
    } catch (error) {
      res.status(500).json({ message: "Error fetching reports", error: error.message });
    }
  });
  

module.exports = router;
