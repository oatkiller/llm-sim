import React from 'react';
import ReactMarkdown from 'react-markdown';
import helpContent from '../docs/help.md?raw';

export const Help: React.FC = () => {
  return (
    <div className="prose prose-sm max-w-none p-4 bg-white rounded-lg shadow">
      <ReactMarkdown>{helpContent}</ReactMarkdown>
    </div>
  );
}; 