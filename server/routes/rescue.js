const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { updateIncidentStatus } = require('../controllers/rescueController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/incidents', verifyToken, authorizeRoles('rescue'), async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ reportedAt: -1 }).populate('user', 'username role');
    res.status(200).json({ incidents });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching incidents', error: error.message });
  }
});

router.put('/update-status/:incidentId', verifyToken, authorizeRoles('rescue'), updateIncidentStatus);

module.exports = router;
