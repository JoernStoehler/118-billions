import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Obituary {
  uuid: string;
  name: string;
  birthYear: number;
  deathYear: number;
  text: string;
  portrait: string;
}

interface ObituaryState {
  obituaries: Record<string, Obituary>; // Store obituaries as a dictionary for efficient access
  currentObituaryUuid: string | null; // Track the current obituary by UUID
  navigationOrder: string[]; // Maintain the navigation order
}

const initialState: ObituaryState = {
  obituaries: {},
  currentObituaryUuid: null,
  navigationOrder: [],
};

const obituarySlice = createSlice({
  name: 'obituaries',
  initialState,
  reducers: {
    setNavigationOrder(state, action: PayloadAction<string[]>) {
      state.navigationOrder = action.payload;
    },
    addObituary(state, action: PayloadAction<Obituary>) {
      state.obituaries[action.payload.uuid] = action.payload;
    },
    setCurrentObituary(state, action: PayloadAction<string>) {
      state.currentObituaryUuid = action.payload;
    },
  },
});

const store = configureStore({
  reducer: {
    obituaries: obituarySlice.reducer,
  },
});

// Fetch navigation.json and dynamically load obituaries
fetch('/navigation.json')
  .then((response) => response.json())
  .then((navigation: { uuids: string[] }) => {
    store.dispatch(obituarySlice.actions.setNavigationOrder(navigation.uuids));

    const preloadObituary = async (uuid: string) => {
      if (!store.getState().obituaries.obituaries[uuid]) {
        const response = await fetch(`/obituaries/${uuid}.json`);
        const obituary = await response.json();
        store.dispatch(obituarySlice.actions.addObituary(obituary));
      }
    };

    const loadInitialObituary = async () => {
      const initialUuid = navigation.uuids[0];
      await preloadObituary(initialUuid);
      store.dispatch(obituarySlice.actions.setCurrentObituary(initialUuid));

      // Preload next and previous obituaries
      if (navigation.uuids.length > 1) {
        preloadObituary(navigation.uuids[1]);
      }
    };

    loadInitialObituary();

    // Listen for changes in the current obituary to preload next/previous
    store.subscribe(() => {
      const state = store.getState().obituaries;
      const currentIndex = state.navigationOrder.indexOf(state.currentObituaryUuid!);

      if (currentIndex > 0) {
        preloadObituary(state.navigationOrder[currentIndex - 1]);
      }
      if (currentIndex < state.navigationOrder.length - 1) {
        preloadObituary(state.navigationOrder[currentIndex + 1]);
      }
    });
  })
  .catch((error) => {
    console.error('Failed to load navigation or obituaries:', error);
  });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const { setNavigationOrder, addObituary, setCurrentObituary } = obituarySlice.actions;
export default store;