import React from 'react';
import Ansi from 'ansi-to-react';

export default function BuildLogs({ logs }) {
  if (!logs) return null;

  return (
    <div
      style={{
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        padding: '1rem',
        borderRadius: '5px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        maxHeight: '400px',
        overflowY: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      }}
    >
      <Ansi>{logs}</Ansi>
    </div>
  );
}
