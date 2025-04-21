import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BuildLogs({ buildId }) {
  const [logs, setLogs] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!buildId) return;
    fetchLogs();
  }, [buildId]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/builds/${buildId}/logs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLogs(res.data.logs);
    } catch (err) {
      setError('Failed to fetch logs');
    }
  };

  return (
    <div>
      <h3>Build Logs</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <pre
        style={{
          backgroundColor: '#222',
          color: '#0f0',
          padding: '1rem',
          height: '400px',
          overflowY: 'scroll',
        }}
      >
        {logs}
      </pre>
    </div>
  );
}
