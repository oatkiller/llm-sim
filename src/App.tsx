import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Sim System
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to your character simulation viewer and creator
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default App;
