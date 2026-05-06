import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UnsplashImage } from '@/types';

interface SearchState {
  query: string;
  results: UnsplashImage[];
  total: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
}

const initialState: SearchState = {
  query: '',
  results: [],
  total: 0,
  totalPages: 0,
  page: 1,
  loading: false,
  error: null,
  hasSearched: false,
};

export const searchPhotos = createAsyncThunk(
  'search/searchPhotos',
  async ({ query, page = 1 }: { query: string; page?: number }) => {
    const res = await fetch(`/api/unsplash/search?q=${encodeURIComponent(query)}&page=${page}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    clearResults(state) {
      state.results = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
      state.hasSearched = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.hasSearched = true;
        state.results = action.payload.results;
        state.total = action.payload.total;
        state.totalPages = action.payload.total_pages;
        state.page = action.meta.arg.page || 1;
      })
      .addCase(searchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Search failed';
      });
  },
});

export const { setQuery, clearResults } = searchSlice.actions;
export default searchSlice.reducer;
