import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { setCurrentObituary } from '../features/store';

const Navigation: React.FC = () => {
    const dispatch = useDispatch();
    const currentObituaryUuid = useSelector((state: RootState) => state.obituaries.currentObituaryUuid);
    const navigationOrder = useSelector((state: RootState) => state.obituaries.navigationOrder);

    const currentIndex = navigationOrder.indexOf(currentObituaryUuid!);

    const handleNext = () => {
        if (currentIndex < navigationOrder.length - 1) {
            dispatch(setCurrentObituary(navigationOrder[currentIndex + 1]));
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            dispatch(setCurrentObituary(navigationOrder[currentIndex - 1]));
        }
    };

    return (
        <div className="flex justify-between items-center p-4">
            <button onClick={handlePrevious} disabled={currentIndex === 0} className="bg-gray-700 text-white p-2 rounded">
                Previous
            </button>
            <span className="text-lg">{currentObituaryUuid}</span>
            <button onClick={handleNext} disabled={currentIndex === navigationOrder.length - 1} className="bg-gray-700 text-white p-2 rounded">
                Next
            </button>
        </div>
    );
};

export default Navigation;