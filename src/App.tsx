import React, { useState, useEffect } from 'react';
import { Navigation, useInitializeNavigation, useNavigateToOffset } from './features/navigation';
import { useSelector } from 'react-redux';
import { RootState } from './features/store';
import { useSwipe } from './features/swipe';
import { Obituary } from './features/obituary';
import { AdminControls } from './features/admin';

const Home: React.FC = () => {
    useInitializeNavigation();
    const currentObituaryUuid = useSelector((state: RootState) => state.navigation.currentUuid);
    const navigateToOffset = useNavigateToOffset();

    useSwipe(() => navigateToOffset(-1), () => navigateToOffset(+1));

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <>
                <Obituary uuid={currentObituaryUuid} />
                <Navigation />
            </>
        </div>
    );
};

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
            {import.meta.env.VITE_DEV_MODE === 'true' && <AdminControls />}
            <Home />
        </div>
    );
};

export default App;