import { ThunkAction, Action } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { dataApi } from './dataSlice';
import navigationReducer from './navigationSlice';

const store = configureStore({
  reducer: {
    [dataApi.reducerPath]: dataApi.reducer,
    navigation: navigationReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(dataApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export default store;