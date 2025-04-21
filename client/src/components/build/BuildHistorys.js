import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BuildHistory({ jobId }) {
  const [builds, setBuilds] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;
    fetchBuildHistory();
  }, [jobId]);

  const fetchBuildHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/builds/job/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBuilds(res.data);
    } catch (err) {
      setError('Failed to fetch build history');
    }
  };

  return (
    <div>
      <h3>Build History</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {builds.map((build) => (
          <li key={build._id}>
            Build #{build._id} — Status: {build.status} — Started:{' '}
            {new Date(build.startedAt).toLocaleString()}
            <button
              onClick={() => {
                /* Show logs logic here */
              }}
            >
              View Logs
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
