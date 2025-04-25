import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobForm from '../components/forms/JobForm';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [editJobId, setEditJobId] = useState(null);
  const [triggerMessage, setTriggerMessage] = useState('');

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      setError('Failed to fetch jobs');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobSubmit = async (jobData) => {
    setError('');
    try {
      if (editJobId) {
        await api.put(`/jobs/${editJobId}`, jobData);
        setEditJobId(null);
      } else {
        await api.post('/jobs', jobData);
      }
      fetchJobs();
    } catch (err) {
      setError('Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setEditJobId(job._id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
    } catch {
      setError('Failed to delete job');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const triggerJob = async (jobId) => {
    try {
      const res = await api.post(`/jobs/${jobId}/trigger`);
      setTriggerMessage('Job triggered successfully!' + res.data.logs);
      console.log(res.data.logs); // Optionally show logs or navigate to logs page
    } catch (err) {
      setError('Failed to trigger job');
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <div>
        <h2>{editJobId ? 'Edit Job' : 'Create a Job'}</h2>
        <JobForm
          onSubmit={handleJobSubmit}
          initialJob={editJobId ? jobs.find((j) => j._id === editJobId) : null}
        />
      </div>

      <h3>Your Jobs</h3>
      <ul>
        {jobs.map((job) => (
          <li key={job._id}>
            <strong>{job.name}</strong> - {job.description || 'No description'}
            <button onClick={() => handleEdit(job)}>Edit</button>
            <button onClick={() => handleDelete(job._id)}>Delete</button>
            <button onClick={() => triggerJob(job._id)}>Run Job</button>
          </li>
        ))}
      </ul>
      {triggerMessage}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
