import React from 'react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Obituary {
  uuid: string;
  name: string;
  birthYear: number;
  deathYear: number;
  text: string;
  portrait: string;
}

export const obituaryApi = createApi({
  reducerPath: 'obituaryApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/production/' }),
  endpoints: (builder) => ({
    fetchObituary: builder.query<Obituary, string>({
      query: (uuid) => `obituaries/${uuid}.json`
    }),
  }),
});
export const { useFetchObituaryQuery, useLazyFetchObituaryQuery } = obituaryApi;

export const Obituary: React.FC<{uuid: string | null}> = ({uuid}) => {
    const [fetchObituary, { data: obituary, error, isLoading, isFetching }] = useLazyFetchObituaryQuery()
    React.useEffect(() => {
        if (uuid) {
            fetchObituary(uuid);
        }
    }, [uuid, fetchObituary]);
    if (!uuid) {
        return <div>No obituary selected</div>;
    }
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