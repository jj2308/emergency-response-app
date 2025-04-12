import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'https://emergency-response-app-3.onrender.com/api';

const CitizenDashboard = () => {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchIncidents(); }, []);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/citizen/my-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(response.data.incidents);
      setLoading(false);
    } catch {
      toast.error('Error fetching incidents');
      setLoading(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/citizen/report-incident`,
        { type, description, location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Incident reported!');
      setType('');
      setDescription('');
      setLocation('');
      fetchIncidents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error reporting incident');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h2>Citizen Dashboard 🧑‍💼</h2>
      <form onSubmit={handleReport} className="form-row">
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="">Type</option>
          <option value="fire">Fire</option>
          <option value="accident">Accident</option>
          <option value="medical">Medical</option>
          <option value="crime">Crime</option>
          <option value="other">Other</option>
        </select>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" required />
        <button type="submit">Report Incident</button>
      </form>

      <h3>My Reported Incidents</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card-grid">
          {incidents.map((incident) => (
            <div key={incident._id} className="card">
              <p><strong>Type:</strong> {incident.type}</p>
              <p><strong>Description:</strong> {incident.description}</p>
              <p><strong>Location:</strong> {incident.location}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status status-${incident.status.replace(' ', '-')}`}>
                  {incident.status.toUpperCase()}
                </span>
              </p>
              <p><strong>Reported At:</strong> {new Date(incident.reportedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
