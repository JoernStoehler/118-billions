import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setCurrentObituary } from '../features/store';
import Obituary from '../components/Obituary';
import Navigation from '../components/Navigation';
import useSwipe from '../hooks/useSwipe';

const Home: React.FC = () => {
    const dispatch = useDispatch();
    const currentObituaryUuid = useSelector((state: RootState) => state.obituaries.currentObituaryUuid);
    const obituaries = useSelector((state: RootState) => state.obituaries.obituaries);
    const navigationOrder = useSelector((state: RootState) => state.obituaries.navigationOrder);

    const navigateToNext = () => {
        if (currentObituaryUuid) {
            const currentIndex = navigationOrder.indexOf(currentObituaryUuid);
            const nextIndex = (currentIndex + 1) % navigationOrder.length;
            const nextUuid = navigationOrder[nextIndex];
            dispatch(setCurrentObituary(nextUuid));
        }
    };

    const navigateToPrevious = () => {
        if (currentObituaryUuid) {
            const currentIndex = navigationOrder.indexOf(currentObituaryUuid);
            const prevIndex = (currentIndex - 1 + navigationOrder.length) % navigationOrder.length;
            const prevUuid = navigationOrder[prevIndex];
            dispatch(setCurrentObituary(prevUuid));
        }
    };

    useSwipe(navigateToPrevious, navigateToNext);

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