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
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const incidentsPerPage = 6;

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 30000); // 30 sec refresh
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/citizen/my-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(response.data.incidents);
    } catch {
      toast.error('Error fetching incidents');
    } finally {
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

  const exportToCSV = () => {
    if (!filteredIncidents.length) {
      toast.info('No incidents to export');
      return;
    }

    const header = ['Type', 'Description', 'Location', 'Status', 'Reported At'];
    const rows = filteredIncidents.map(incident => [
      incident.type,
      incident.description,
      incident.location,
      incident.status,
      new Date(incident.reportedAt).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `citizen_incidents_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported successfully!');
  };

  const filteredIncidents = incidents.filter(incident => {
    return (
      (filterType ? incident.type === filterType : true) &&
      (filterLocation ? incident.location.toLowerCase().includes(filterLocation.toLowerCase()) : true) &&
      (filterDescription ? incident.description.toLowerCase().includes(filterDescription.toLowerCase()) : true)
    );
  });

  const indexOfLastIncident = currentPage * incidentsPerPage;
  const indexOfFirstIncident = indexOfLastIncident - incidentsPerPage;
  const currentIncidents = filteredIncidents.slice(indexOfFirstIncident, indexOfLastIncident);
  const totalPages = Math.ceil(filteredIncidents.length / incidentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h2>Citizen Dashboard 🧑‍💼</h2>

      {/* ✅ Report Form */}
      <form onSubmit={handleReport} className="form-row">
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="">Select Type</option>
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

      {/* ✅ Filters */}
      <div className="form-row">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Filter by Type</option>
          <option value="fire">Fire</option>
          <option value="accident">Accident</option>
          <option value="medical">Medical</option>
          <option value="crime">Crime</option>
          <option value="other">Other</option>
        </select>
        <input placeholder="Search by Description" value={filterDescription} onChange={(e) => setFilterDescription(e.target.value)} />
        <input placeholder="Search by Location" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
        <button type="button" onClick={() => {
          setFilterType('');
          setFilterDescription('');
          setFilterLocation('');
        }}>Clear Filters</button>
      </div>

      <button className="export-button" onClick={exportToCSV}>Export to CSV</button>

      <h3>My Reported Incidents</h3>

      {loading ? (
        <p>Loading incidents...</p>
      ) : (
        <div>
          <div className="card-grid">
            {currentIncidents.length === 0 ? (
              <p>No incidents match the filters.</p>
            ) : (
              currentIncidents.map(incident => (
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
              ))
            )}
          </div>

          {/* ✅ Pagination */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {[...Array(totalPages).keys()].map(number => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                style={{ backgroundColor: currentPage === number + 1 ? '#007bff' : 'gray', color: 'white' }}
              >
                {number + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
