import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'https://emergency-response-app-3.onrender.com/api';

const RescueDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchIncidents(); }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/rescue/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(response.data.incidents);
      setLoading(false);
    } catch {
      toast.error('Error fetching incidents');
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/rescue/update-status/${incidentId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Status updated!');
      fetchIncidents();
    } catch {
      toast.error('Error updating status');
    }
  };

  const exportToCSV = () => {
    const header = ['Type', 'Description', 'Location', 'Status', 'Reported At'];
    const rows = incidents.map(incident => [
      incident.type,
      incident.description,
      incident.location,
      incident.status,
      new Date(incident.reportedAt).toLocaleString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'incidents.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h2>Rescue Dashboard 🚨</h2>
      <button className="export-button" onClick={exportToCSV}>Export to CSV</button>

      {loading ? (
        <p>Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <p>No incidents available.</p>
      ) : (
        <div className="card-grid">
          {incidents.map((incident) => (
            <div key={incident._id} className="card">
              <p><strong>Type:</strong> {incident.type}</p>
              <p><strong>Description:</strong> {incident.description}</p>
              <p><strong>Location:</strong> {incident.location}</p>
              <p><strong>Reported By:</strong> {incident.user?.username}</p>
              <p style={{ color: 'gray', fontSize: '0.9rem' }}>{incident.user?.email}</p>
              <p><strong>Status:</strong>{' '}
                <span className={`status status-${incident.status.replace(' ', '-')}`}>
                  {incident.status.toUpperCase()}
                </span>
              </p>
              <p><strong>Reported At:</strong> {new Date(incident.reportedAt).toLocaleString()}</p>
              <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => updateIncidentStatus(incident._id, 'in-progress')}>Mark In Progress</button>
                <button onClick={() => updateIncidentStatus(incident._id, 'resolved')}>Mark Resolved</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RescueDashboard;
