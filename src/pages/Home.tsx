import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';
import Obituary from '../components/Obituary';
import Navigation from '../components/Navigation';

const Home: React.FC = () => {
    const currentObituaryUuid = useSelector((state: RootState) => state.obituaries.currentObituaryUuid);
    const obituaries = useSelector((state: RootState) => state.obituaries.obituaries);
    const navigationOrder = useSelector((state: RootState) => state.obituaries.navigationOrder);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {currentObituaryUuid && obituaries[currentObituaryUuid] ? (
                <>
                    <Obituary uuid={currentObituaryUuid} />
                    <Navigation />
                </>
            ) : (
                <div className="text-center p-4 bg-red-100 rounded shadow-md">
                    <h2 className="text-xl font-bold">Obituary Not Loading</h2>
                    <p>Check the debug panel for more information.</p>
                </div>
            )}
        </div>
    );
};

export default Home;