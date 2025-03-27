import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store'; // Updated import path

interface ObituaryProps {
    uuid: string;
}

const Obituary: React.FC<ObituaryProps> = ({ uuid }) => {
    const obituary = useSelector((state: RootState) => state.obituaries.obituaries[uuid]);

    if (!obituary) {
        return <div>Loading...</div>;
    }

    const { name, birthYear, deathYear, text, portrait } = obituary;

    return (
        <div className="flex flex-col items-center p-4 bg-gray-100 text-gray-800">
            <img src={portrait} alt={`${name}'s portrait`} className="w-32 h-32 rounded-full mb-4" />
            <h1 className="text-2xl font-bold mb-2">{name}</h1>
            <p className="text-lg mb-2">{birthYear} - {deathYear}</p>
            <p className="mb-4">{text}</p>
        </div>
    );
};

export default Obituary;