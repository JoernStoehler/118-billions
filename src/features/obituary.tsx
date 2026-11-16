import React from 'react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MapHandle, Map } from './map';

export type Obituary = {
  uuid: string;
  name: string;
  birth_date_modern: string;
  death_date_modern: string;
  birth_date_local: string;
  death_date_local: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  text: string;
};

export const obituaryApi = createApi({
  reducerPath: 'obituaryApi',
  baseQuery: fetchBaseQuery({ baseUrl: `/${import.meta.env.VITE_OBITUARY_FOLDER}/` }),
  endpoints: (builder) => ({
    fetchObituary: builder.query<Obituary, string>({
      query: (uuid) => `obituaries/${uuid}.json`
    }),
  }),
});
export const { useFetchObituaryQuery, useLazyFetchObituaryQuery } = obituaryApi;

export const Obituary: React.FC<{ uuid: string | null }> = ({ uuid }) => {
  const [fetchObituary, { data: obituary, error, isLoading, isFetching }] = useLazyFetchObituaryQuery();
  const mapRef = React.useRef<MapHandle | null>(null);

  React.useEffect(() => {
    if (uuid) {
      fetchObituary(uuid);
      const img = new Image();
      img.src = `/${import.meta.env.VITE_OBITUARY_FOLDER}/obituaries/${uuid}.png`;
    }
  }, [uuid, fetchObituary]);

  const imageSrc = `/${import.meta.env.VITE_OBITUARY_FOLDER}/obituaries/${obituary?.uuid}.png`;

  React.useEffect(() => {
    if (mapRef.current && obituary?.coordinates) {
      mapRef.current.pointOfView({
        lat: obituary.coordinates.latitude,
        lng: obituary.coordinates.longitude,
        altitude: 1,
      });
    }
  }, [obituary]);

  return (
    <div className="flex flex-col items-center p-4 max-w-screen-md mx-auto">
      <img
        src={imageSrc}
        alt={`${obituary?.name}'s portrait`}
        className="max-w-full max-h-64 object-contain rounded mb-4"
      />
      <h1 className="text-2xl font-bold mb-2">{obituary?.name}</h1>
      <p className="text-lg mb-2">{obituary?.birth_date_local} - {obituary?.death_date_local}</p>
      <p className="text-lg mb-2">({obituary?.birth_date_modern} - {obituary?.death_date_modern})</p>
      <p className="mb-4">{obituary?.text}</p>
      {obituary?.coordinates && (
        <Map
          ref={mapRef}
          latitude={obituary.coordinates.latitude}
          longitude={obituary.coordinates.longitude}
          altText={`${obituary?.name}'s location`}
        />
      )}
    </div>
  );
};