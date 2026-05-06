import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UnsplashImage } from '@/types';
import { CollectionImage } from '@/types';

interface ImageState {
  currentImage: UnsplashImage | null;
  imageCollections: { collectionId: number; collectionName: string; entry: CollectionImage }[];
  loading: boolean;
  error: string | null;
}

const initialState: ImageState = {
  currentImage: null,
  imageCollections: [],
  loading: false,
  error: null,
};

export const fetchImageDetail = createAsyncThunk('image/fetchDetail', async (id: string) => {
  const res = await fetch(`/api/unsplash/photos/${id}`);
  if (!res.ok) throw new Error('Failed to fetch image');
  return res.json();
});

export const fetchImageCollections = createAsyncThunk(
  'image/fetchCollections',
  async (imageId: string) => {
    const res = await fetch(`/api/collections/by-image/${imageId}`);
    if (!res.ok) throw new Error('Failed to fetch image collections');
    return res.json();
  }
);

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    clearImage(state) {
      state.currentImage = null;
      state.imageCollections = [];
      state.error = null;
    },
    removeCollectionFromImage(state, action) {
      state.imageCollections = state.imageCollections.filter(
        ic => ic.collectionId !== action.payload
      );
    },
    addCollectionToImage(state, action) {
      state.imageCollections.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImageDetail.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchImageDetail.fulfilled, (state, action) => { state.loading = false; state.currentImage = action.payload; })
      .addCase(fetchImageDetail.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Error'; })
      .addCase(fetchImageCollections.fulfilled, (state, action) => { state.imageCollections = action.payload; });
  },
});

export const { clearImage, removeCollectionFromImage, addCollectionToImage } = imageSlice.actions;
export default imageSlice.reducer;
