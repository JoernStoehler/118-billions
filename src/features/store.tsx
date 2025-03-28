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
fetch('/production/navigation.json')
  .then((response) => response.json())
  .then((navigation: { uuids: string[], navigationOrder?: string[] }) => {
    // Use navigationOrder if available, otherwise use uuids
    const order = navigation.navigationOrder || navigation.uuids;
    
    store.dispatch(obituarySlice.actions.setNavigationOrder(order));
    const preloadObituary = async (uuid: string) => {
      if (!store.getState().obituaries.obituaries[uuid]) {
        try {
          const response = await fetch(`/production/obituaries/${uuid}.json`);
          if (!response.ok) {
            throw new Error(`Failed to fetch obituary: ${response.status}`);
          }
          
          const obituaryData = await response.json();
          
          // Add the UUID to the obituary data since it's not in the JSON file
          const obituary: Obituary = {
            ...obituaryData,
            uuid, // Add UUID from the filename
            // Ensure portrait path is properly formed
            portrait: obituaryData.portrait.startsWith('/') 
              ? obituaryData.portrait 
              : `/production/obituaries/${obituaryData.portrait}`
          };
          
          store.dispatch(obituarySlice.actions.addObituary(obituary));
          console.log(`Loaded obituary: ${uuid}`);
        } catch (error) {
          console.error(`Failed to load obituary ${uuid}:`, error);
        }
      }
    };
    const loadInitialObituary = async () => {
      if (order.length === 0) {
        console.error('No obituaries found in navigation order');
        return;
      }
      
      const initialUuid = order[0];
      await preloadObituary(initialUuid);
      store.dispatch(obituarySlice.actions.setCurrentObituary(initialUuid));
      console.log(`Set current obituary to: ${initialUuid}`);
      
      // Preload next and previous obituaries
      if (order.length > 1) {
        preloadObituary(order[1]);
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