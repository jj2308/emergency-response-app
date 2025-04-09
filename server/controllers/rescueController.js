const Incident = require('../models/Incident');

// Rescue team: Update incident status
exports.updateIncidentStatus = async (req, res) => {
  const { incidentId } = req.params;
  const { status } = req.body;

  try {
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    incident.status = status;
    await incident.save();

    res.status(200).json({ message: 'Incident status updated successfully', incident });
  } catch (error) {
    res.status(500).json({ message: 'Error updating incident status', error: error.message });
  }
};
