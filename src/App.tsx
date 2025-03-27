import React from 'react';
import Home from './pages/Home';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {/* Debugging elements */}
      <div className="absolute top-0 left-0 p-4 bg-red-200 text-black">
        <h2>App Debug Info</h2>
        <p>App Component Rendered Successfully</p>
      </div>

      <Home />
    </div>
  );
};

export default App;