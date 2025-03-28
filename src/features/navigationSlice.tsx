import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { dataApi, useFetchNavigationOrderQuery } from './dataSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { useEffect } from 'react';

interface NavigationState {
  currentUuid: string | null;
}

export function atOffset(currentUuid: string | null, order: string[], offset: number): string | null {
  if (!currentUuid || order.length === 0) {
    return null;
  }
  const currentIndex = order.indexOf(currentUuid);
  if (currentIndex === -1) {
    return null;
  }
  const newIndex = (currentIndex + offset + order.length) % order.length;
  return order[newIndex];
}

const navigationSlice = createSlice({
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

export function useInitializeNavigation() {
  const dispatch = useDispatch();
  const { data: order, error, isLoading, isFetching } = useFetchNavigationOrderQuery();

  useEffect(() => {
    if (order && order.length > 0) {
      dispatch(setCurrentUuid(order[0]));
    }
  }, [order, dispatch]);
}

export function useNavigateToOffset() {
  const dispatch = useDispatch();
  const currentUuid = useSelector((state: RootState) => state.navigation.currentUuid);
  const { data: order } = useFetchNavigationOrderQuery();
  const prefetchObituary = dataApi.usePrefetch("fetchObituary");
  const prefetchOffsets = [-1, +1];

  return (offset: number) => {
    if (!order) return;
    if (!currentUuid) return;
    const newUuid = atOffset(currentUuid, order, offset);
    if (!newUuid) return;
    dispatch(setCurrentUuid(newUuid));

    prefetchOffsets
      .map((offset) => atOffset(currentUuid, order, offset))
      .filter((uuid => uuid !== null))
      .forEach((uuid) => prefetchObituary(uuid));
  };
}

export const { setCurrentUuid } = navigationSlice.actions;
export default navigationSlice.reducer;