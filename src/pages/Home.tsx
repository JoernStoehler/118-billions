import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';
import Obituary from '../components/Obituary';
import Navigation from '../components/Navigation';

const Home: React.FC = () => {
    const currentObituaryUuid = useSelector((state: RootState) => state.obituaries.currentObituaryUuid);
    const obituaries = useSelector((state: RootState) => state.obituaries.obituaries);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {currentObituaryUuid && obituaries[currentObituaryUuid] && (
                <>
                    <Obituary uuid={currentObituaryUuid} />
                    <Navigation />
                </>
            )}
        </div>
    );
};

export default Home;