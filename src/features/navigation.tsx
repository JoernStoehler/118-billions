import React from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, AppThunk } from './store';
import { useEffect } from 'react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { obituaryApi } from './obituary';


interface Navigation {
  order: string[];
}

export const navigationApi = createApi({
  reducerPath: 'navigationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/production/' }),
  endpoints: (builder) => ({
    fetchNavigationOrder: builder.query<Navigation, void>({
      query: () => 'navigation.json'
    }),
  }),
});
export const { useFetchNavigationOrderQuery } = navigationApi;

export function rotate<T>(offset: number, el: T | null, arr: T[]): T | null {
  if (!el || !arr || arr.length === 0 || !arr.includes(el)) return null;
  const index = arr.indexOf(el);
  const newIndex = (index + offset + arr.length) % arr.length;
  return arr[newIndex];
}

export interface NavigationState {
  currentUuid: string | null;
}

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    currentUuid: null,
  } as NavigationState,
  reducers: {
    setCurrentUuid: (state, action: PayloadAction<string | null>) => {
      state.currentUuid = action.payload;
    },
  },
});
export const { setCurrentUuid } = navigationSlice.actions;

export function useInitializeNavigation() {
  const dispatch = useDispatch();
  const { data: navigation, error, isLoading, isFetching } = useFetchNavigationOrderQuery();

  useEffect(() => {
    if (navigation && navigation.order && navigation.order.length > 0) {
      dispatch(setCurrentUuid(navigation.order[0]));
    }
  }, [navigation, dispatch]);
}

export function useNavigateToOffset() {
  const dispatch = useDispatch();
  const currentUuid = useSelector((state: RootState) => state.navigation.currentUuid);
  const { data: navigation } = useFetchNavigationOrderQuery();
  const order = navigation?.order ?? [];
  const prefetchObituary = obituaryApi.usePrefetch("fetchObituary");
  const prefetchOffsets = [-1, +1];
  
  return (offset: number) => {
    const newUuid = rotate<string>(offset, currentUuid, order);  
    dispatch(setCurrentUuid(newUuid));

    prefetchOffsets
      .map((offset) => rotate<string>(offset, newUuid, order))
      .filter((uuid => uuid !== null))
      .forEach((uuid) => prefetchObituary(uuid));
  };
}

export const Navigation: React.FC = () => {
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