import React, { useState } from 'react';
import PipelineStepDropdown from '../dropdowns/PipelineSteps';

export default function JobForm({ onSubmit, initialJob }) {
  const [name, setName] = useState(initialJob?.name || '');
  const [description, setDescription] = useState(initialJob?.description || '');

  // Manage steps as an array of objects, not JSON string
  const [steps, setSteps] = useState(initialJob?.config?.steps || []);
  const [error, setError] = useState('');

  // Called when dropdown selection changes
  const handleAddStep = (step) => {
    // Avoid duplicates by step name
    if (!steps.find((s) => s.name === step.name)) {
      setSteps([...steps, step]);
    }
  };

  // Remove step by name
  const handleRemoveStep = (stepName) => {
    setSteps(steps.filter((s) => s.name !== stepName));
  };

  // Initialize repo configuration state
  const [repo, setRepo] = useState(() => ({
    provider: initialJob?.config?.repo?.provider || '',
    url: initialJob?.config?.repo?.url || '',
    branch: initialJob?.config?.repo?.branch || 'main',
    credentials: initialJob?.config?.repo?.credentials || { token: '' },
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      setError('Job name is required');
      return;
    }
    setError('');

    // Include repo config in submission
    onSubmit({
      name,
      description,
      config: {
        steps,
        repo: {
          provider: repo.provider,
          url: repo.url,
          branch: repo.branch,
          credentials: repo.credentials,
        },
      },
    });
  };

  // Rest of the component remains the same...

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Job Name"
        required
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />

      <div>
        <h3>Repository Configuration</h3>
        <select
          value={repo.provider}
          onChange={(e) => setRepo({ ...repo, provider: e.target.value })}
        >
          <option value="">Select Provider</option>
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
          <option value="bitbucket">Bitbucket</option>
        </select>

        <input
          placeholder="Repo URL"
          value={repo.url}
          onChange={(e) => setRepo({ ...repo, url: e.target.value })}
        />

        <input
          placeholder="Branch"
          value={repo.branch}
          onChange={(e) => setRepo({ ...repo, branch: e.target.value })}
        />

        <input
          placeholder="Access Token"
          type="password"
          value={repo.credentials?.token || ''}
          onChange={(e) =>
            setRepo({ ...repo, credentials: { token: e.target.value } })
          }
        />
      </div>

      <label>Pipeline Steps:</label>
      <PipelineStepDropdown onSelect={handleAddStep} />

      <ul>
        {steps.map((step) => (
          <li key={step.name}>
            <strong>{step.name}</strong> - {step.run}{' '}
            <button type="button" onClick={() => handleRemoveStep(step.name)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">Save Job</button>
    </form>
  );
}
