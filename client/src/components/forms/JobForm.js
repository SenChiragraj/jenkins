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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      setError('Job name is required');
      return;
    }
    setError('');
    // Send steps as config.steps
    onSubmit({ name, description, config: { steps } });
    setName('');
    setDescription('');
    setSteps([]);
  };

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
