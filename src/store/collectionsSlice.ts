import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Collection, CollectionImage } from "@/types";

interface CollectionsState {
  collections: Collection[];
  selectedCollection: Collection | null;
  collectionImages: CollectionImage[];
  loading: boolean;
  imagesLoading: boolean;
  error: string | null;
}

const initialState: CollectionsState = {
  collections: [],
  selectedCollection: null,
  collectionImages: [],
  loading: false,
  imagesLoading: false,
  error: null,
};

export const fetchCollections = createAsyncThunk(
  "collections/fetchAll",
  async () => {
    const res = await fetch("/api/collections");
    if (!res.ok) throw new Error("Failed to fetch collections");
    return res.json();
  },
);

export const fetchCollectionById = createAsyncThunk(
  "collections/fetchById",
  async (id: number) => {
    const res = await fetch(`/api/collections/${id}`);
    if (!res.ok) throw new Error("Failed to fetch collection");
    return res.json();
  },
);

export const fetchCollectionImages = createAsyncThunk(
  "collections/fetchImages",
  async (collectionId: number) => {
    const res = await fetch(`/api/collections/${collectionId}/images`);
    if (!res.ok) throw new Error("Failed to fetch collection images");
    return res.json();
  },
);

export const createCollection = createAsyncThunk(
  "collections/create",
  async (name: string) => {
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create collection");
    return res.json();
  },
);

export const addImageToCollection = createAsyncThunk(
  "collections/addImage",
  async ({
    collectionId,
    imageData,
  }: {
    collectionId: number;
    imageData: Omit<CollectionImage, "id" | "collection_id" | "created_at">;
  }) => {
    const res = await fetch(`/api/collections/${collectionId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(imageData),
    });
    if (!res.ok) throw new Error("Failed to add image to collection");
    return { collectionId, image: await res.json() };
  },
);

export const deleteCollection = createAsyncThunk(
  "collections/delete",
  async (id: number) => {
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete collection");
    return id;
  },
);

export const removeImageFromCollection = createAsyncThunk(
  "collections/removeImage",
  async ({
    collectionId,
    imageId,
  }: {
    collectionId: number;
    imageId: string;
  }) => {
    const res = await fetch(
      `/api/collections/${collectionId}/images/${imageId}`,
      {
        method: "DELETE",
      },
    );
    if (!res.ok) throw new Error("Failed to remove image");
    return { collectionId, imageId };
  },
);

const collectionsSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    clearSelectedCollection(state) {
      state.selectedCollection = null;
      state.collectionImages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error";
      })

      .addCase(fetchCollectionById.fulfilled, (state, action) => {
        state.selectedCollection = action.payload;
      })

      .addCase(fetchCollectionImages.pending, (state) => {
        state.imagesLoading = true;
      })
      .addCase(fetchCollectionImages.fulfilled, (state, action) => {
        state.imagesLoading = false;
        state.collectionImages = action.payload;
      })
      .addCase(fetchCollectionImages.rejected, (state) => {
        state.imagesLoading = false;
      })

      .addCase(createCollection.fulfilled, (state, action) => {
        state.collections.unshift(action.payload);
      })

      .addCase(
        addImageToCollection.fulfilled,
        (
          state,
          action: PayloadAction<{
            collectionId: number;
            image: CollectionImage;
          }>,
        ) => {
          const col = state.collections.find(
            (c) => c.id === action.payload.collectionId,
          );
          if (col) col.image_count = (col.image_count || 0) + 1;
          if (state.selectedCollection?.id === action.payload.collectionId) {
            state.collectionImages.push(action.payload.image);
          }
        },
      )

      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.collections = state.collections.filter(
          (c) => c.id !== action.payload,
        );
      })

      .addCase(removeImageFromCollection.fulfilled, (state, action) => {
        const col = state.collections.find(
          (c) => c.id === action.payload.collectionId,
        );
        if (col && col.image_count)
          col.image_count = Math.max(0, col.image_count - 1);
        state.collectionImages = state.collectionImages.filter(
          (img) => img.image_id !== action.payload.imageId,
        );
      });
  },
});

export const { clearSelectedCollection } = collectionsSlice.actions;
export default collectionsSlice.reducer;
