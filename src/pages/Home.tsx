import React from 'react';
import { useInitializeNavigation } from '../features/navigationSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { useNavigateToOffset } from '../features/navigationSlice';
import Obituary from '../components/Obituary';
import Navigation from '../components/Navigation';
import useSwipe from '../hooks/useSwipe';

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

export default Home;