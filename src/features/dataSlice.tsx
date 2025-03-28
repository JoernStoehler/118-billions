import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Obituary {
  uuid: string;
  name: string;
  birthYear: number;
  deathYear: number;
  text: string;
  portrait: string;
}

export const dataApi = createApi({
  reducerPath: 'dataApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/production/' }),
  endpoints: (builder) => ({
    fetchObituary: builder.query<Obituary, string>({
      query: (uuid) => `obituaries/${uuid}.json`
    }),
    fetchNavigationOrder: builder.query<string[], void>({
      query: () => 'navigation.json',
      transformResponse: (response: { order: string[] }) => response.order,
    }),
  }),
});

export const { useFetchObituaryQuery, useFetchNavigationOrderQuery } = dataApi;