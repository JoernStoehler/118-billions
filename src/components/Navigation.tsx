import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigateToOffset } from '../features/navigationSlice';
import { useFetchNavigationOrderQuery } from '../features/dataSlice';
import { RootState, AppDispatch, AppThunk } from '../features/store';
import { useSelector } from 'react-redux';

const Navigation: React.FC = () => {
    const navigateTo = useNavigateToOffset();

    return (
        <div className="flex justify-between items-center p-4">
            <button onClick={() => navigateTo(-1)} className="bg-gray-700 text-white p-2 rounded">
                Previous
            </button>
            <button onClick={() => navigateTo(+1)} className="bg-gray-700 text-white p-2 rounded">
                Next
            </button>
        </div>
    );
};

export default Navigation;