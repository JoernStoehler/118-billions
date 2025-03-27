import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Obituary {
  uuid: string;
  name: string;
  birthYear: number;
  deathYear: number;
  text: string;
  portrait: string;
}

interface ObituaryState {
  obituaries: Obituary[];
  currentObituaryIndex: number;
}

const initialState: ObituaryState = {
  obituaries: [],
  currentObituaryIndex: 0,
};

const obituarySlice = createSlice({
  name: 'obituaries',
  initialState,
  reducers: {
    loadObituaries(state: ObituaryState, action: PayloadAction<Obituary[]>) {
      state.obituaries = action.payload;
    },
    nextObituary(state: ObituaryState) {
      state.currentObituaryIndex = (state.currentObituaryIndex + 1) % state.obituaries.length;
    },
    previousObituary(state: ObituaryState) {
      state.currentObituaryIndex = (state.currentObituaryIndex - 1 + state.obituaries.length) % state.obituaries.length;
    },
    setCurrentObituary(state: ObituaryState, action: PayloadAction<number>) {
      state.currentObituaryIndex = action.payload;
    },
  },
});

export const { loadObituaries, nextObituary, previousObituary, setCurrentObituary } = obituarySlice.actions;

export default obituarySlice.reducer;