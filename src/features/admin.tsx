import React from 'react';
import { useNavigateToOffset } from './navigation';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from './store';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    move: builder.mutation<void, { uuid: string, action: 'like' | 'dislike' }>({
      query: ({ uuid, action }) => ({
        url: 'move',
        method: 'POST',
        body: { uuid, action },
      }),
    }),
    generate: builder.mutation<void, { uuid: string }>({
      query: ({ uuid }) => ({
        url: 'generate',
        method: 'POST',
        body: { uuid },
      }),
    }),
  }),
});
export const { useMoveMutation, useGenerateMutation } = adminApi;

export const AdminControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUuid = useSelector((state: RootState) => state.navigation.currentUuid);
  const navigateToOffset = useNavigateToOffset();
  const [move] = useMoveMutation();
  const [generate] = useGenerateMutation();


  const handleAction = async (action: 'like' | 'dislike') => {
    if (!currentUuid) return;
    try {
      await move({ uuid: currentUuid, action }).unwrap();
      navigateToOffset(+1);
    } catch (error) {
      console.error('Error moving obituary:', error);
    }
  };

  const handleRegenerate = async () => {
    if (!currentUuid) return;
    try {
      await generate({ uuid: currentUuid }).unwrap();
    } catch (error) {
      console.error('Error generating obituary:', error);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>
      <button
        style={{ margin: '5px', padding: '10px', backgroundColor: 'green', color: 'white' }}
        onClick={() => handleAction('like')}
      >
        👍
      </button>
      <button
        style={{ margin: '5px', padding: '10px', backgroundColor: 'red', color: 'white' }}
        onClick={() => handleAction('dislike')}
      >
        👎
      </button>
      <button
        style={{ margin: '5px', padding: '10px', backgroundColor: 'blue', color: 'white' }}
        onClick={handleRegenerate}
      >
        🔄
      </button>
    </div>
  );
};