import React, { useState, useEffect } from 'react';
import Home from './pages/Home';

const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Initialize theme based on the current class on the root element
        return !document.documentElement.classList.contains('light-mode');
    });

    useEffect(() => {
        // Apply the theme on initial render
        document.documentElement.classList.toggle('light-mode', !isDarkMode);
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 p-2 bg-gray-700 text-white rounded flex items-center justify-center w-10 h-10"
                aria-label="Toggle theme"
            >
                {isDarkMode ? '🌙' : '🌞'}
            </button>
            <Home />
        </div>
    );
};

export default App;