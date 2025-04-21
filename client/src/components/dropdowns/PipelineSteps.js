import React, { useState } from 'react';

const pipelineConfig = {
  steps: [
    { name: 'Install dependencies', run: 'npm install' },
    { name: 'Run tests', run: 'npm test' },
    { name: 'Build project', run: 'npm run build' },
  ],
};

export default function PipelineStepDropdown({ onSelect }) {
  const [selectedStepName, setSelectedStepName] = useState('');

  const handleChange = (e) => {
    const stepName = e.target.value;
    setSelectedStepName(stepName);

    if (stepName && onSelect) {
      const step = pipelineConfig.steps.find((s) => s.name === stepName);
      if (step) {
        onSelect(step);
      }
    }
  };

  return (
    <select value={selectedStepName} onChange={handleChange}>
      <option value="">-- Select a pipeline step --</option>
      {pipelineConfig.steps.map((step) => (
        <option key={step.name} value={step.name}>
          {step.name}
        </option>
      ))}
    </select>
  );
}
