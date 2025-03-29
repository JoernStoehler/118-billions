import { ThunkAction, Action } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { obituaryApi } from './obituary';
import { navigationApi, navigationSlice } from './navigation';
import { adminApi } from './admin';

const store = configureStore({
  reducer: {
    [obituaryApi.reducerPath]: obituaryApi.reducer,
    [navigationApi.reducerPath]: navigationApi.reducer,
    navigation: navigationSlice.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(obituaryApi.middleware, navigationApi.middleware, adminApi.middleware),
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