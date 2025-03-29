import { ThunkAction, Action } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { obituaryApi } from './obituary';
import { navigationApi, navigationSlice } from './navigation';

const store = configureStore({
  reducer: {
    [obituaryApi.reducerPath]: obituaryApi.reducer,
    [navigationApi.reducerPath]: navigationApi.reducer,
    navigation: navigationSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(obituaryApi.middleware, navigationApi.middleware),
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