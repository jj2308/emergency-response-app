import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'https://emergency-response-app-3.onrender.com/api';

const RescueDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const incidentsPerPage = 6;

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000); // Auto-refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/rescue/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(response.data.incidents);
    } catch {
      toast.error('Error fetching incidents');
    } finally {
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
    if (incidents.length === 0) {
      toast.info('No incidents to export');
      return;
    }

    const header = ['Type', 'Description', 'Location', 'Reported By', 'Status', 'Reported At'];
    const rows = incidents.map(incident => [
      incident.type,
      incident.description,
      incident.location,
      incident.user?.username || 'N/A',
      incident.status,
      new Date(incident.reportedAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `incidents_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Exported successfully!');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Pagination Logic
  const indexOfLastIncident = currentPage * incidentsPerPage;
  const indexOfFirstIncident = indexOfLastIncident - incidentsPerPage;
  const currentIncidents = incidents.slice(indexOfFirstIncident, indexOfLastIncident);
  const totalPages = Math.ceil(incidents.length / incidentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h2>Rescue Dashboard 🚨</h2>
      <button className="export-button" onClick={exportToCSV}>Export to CSV</button>

      {/* Summary */}
      <div style={{ margin: '20px 0', textAlign: 'center', fontWeight: 'bold' }}>
        Total: {incidents.length} |{' '}
        Pending: {incidents.filter(i => i.status === 'pending').length} |{' '}
        In Progress: {incidents.filter(i => i.status === 'in-progress').length} |{' '}
        Resolved: {incidents.filter(i => i.status === 'resolved').length}
      </div>

      {loading ? (
        <p>Loading incidents...</p>
      ) : (
        <>
          <div className="card-grid">
            {currentIncidents.map(incident => (
              <div key={incident._id} className="card">
                <p><strong>Type:</strong> {incident.type}</p>
                <p><strong>Description:</strong> {incident.description}</p>
                <p><strong>Location:</strong> {incident.location}</p>
                <p><strong>Reported By:</strong> {incident.user?.username}</p>
                <p style={{ color: 'gray', fontSize: '0.9rem' }}>{incident.user?.email || ''}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`status status-${incident.status.replace(' ', '-')}`}>
                    {incident.status.toUpperCase()}
                  </span>
                </p>
                <p><strong>Reported At:</strong> {new Date(incident.reportedAt).toLocaleString()}</p>
                <div className="button-group">
                  <button onClick={() => updateIncidentStatus(incident._id, 'in-progress')}>
                    Mark In Progress
                  </button>
                  <button onClick={() => updateIncidentStatus(incident._id, 'resolved')}>
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {[...Array(totalPages).keys()].map(number => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                style={{
                  backgroundColor: currentPage === number + 1 ? '#007bff' : 'gray',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                {number + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RescueDashboard;
