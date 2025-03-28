import React from 'react';
import { useFetchObituaryQuery } from '../features/dataSlice';

const Obituary: React.FC<{uuid: string | null}> = ({uuid}) => {
    if (!uuid) {
        return <div>No obituary selected</div>;
    }
    const { data: obituary, error, isLoading, isFetching } = useFetchObituaryQuery(uuid);
    if (error) {
        return <div>Error loading obituary</div>;
    }
    if (isLoading || isFetching) {
        return <div>Loading...</div>;
    }
    if (!obituary) {
        return <div>No obituary found</div>;
    }

    const { name, birthYear, deathYear, text, portrait } = obituary;
    return (
        <div className="flex flex-col items-center p-4">
            <img src={portrait} alt={`${name}'s portrait`} className="w-32 h-32 rounded-full mb-4" />
            <h1 className="text-2xl font-bold mb-2">{name}</h1>
            <p className="text-lg mb-2">{birthYear} - {deathYear}</p>
            <p className="mb-4">{text}</p>
        </div>
    );
};

export default Obituary;