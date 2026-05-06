import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './searchSlice';
import collectionsReducer from './collectionsSlice';
import imageReducer from './imageSlice';

export const store = configureStore({
  reducer: {
    search: searchReducer,
    collections: collectionsReducer,
    image: imageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
