import collectionsReducer, {
  fetchCollections,
  createCollection,
  deleteCollection,
  addImageToCollection,
  removeImageFromCollection,
  clearSelectedCollection,
} from "./collectionsSlice";
import { Collection } from "@/types";

const col: Collection = {
  id: 1,
  name: "Nature",
  created_at: "2024-01-01",
  image_count: 2,
  cover_image: null,
};

const initialState = {
  collections: [],
  selectedCollection: null,
  collectionImages: [],
  loading: false,
  imagesLoading: false,
  error: null,
};

describe("collectionsSlice — reducers", () => {
  it("returns initial state", () => {
    expect(collectionsReducer(undefined, { type: "@@INIT" })).toEqual(
      initialState,
    );
  });

  it("clearSelectedCollection resets selected + images", () => {
    const state = collectionsReducer(
      {
        ...initialState,
        selectedCollection: col,
        collectionImages: [{} as never],
      },
      clearSelectedCollection(),
    );
    expect(state.selectedCollection).toBeNull();
    expect(state.collectionImages).toEqual([]);
  });
});

describe("collectionsSlice — fetchCollections", () => {
  it("sets loading on pending", () => {
    const s = collectionsReducer(initialState, {
      type: fetchCollections.pending.type,
    });
    expect(s.loading).toBe(true);
  });

  it("stores collections on fulfilled", () => {
    const action = { type: fetchCollections.fulfilled.type, payload: [col] };
    const s = collectionsReducer(initialState, action);
    expect(s.collections).toEqual([col]);
    expect(s.loading).toBe(false);
  });

  it("stores error on rejected", () => {
    const s = collectionsReducer(initialState, {
      type: fetchCollections.rejected.type,
      error: { message: "err" },
    });
    expect(s.error).toBe("err");
  });
});

describe("collectionsSlice — createCollection", () => {
  it("prepends new collection", () => {
    const action = { type: createCollection.fulfilled.type, payload: col };
    const s = collectionsReducer({ ...initialState, collections: [] }, action);
    expect(s.collections[0]).toEqual(col);
  });
});

describe("collectionsSlice — deleteCollection", () => {
  it("removes collection by id", () => {
    const action = { type: deleteCollection.fulfilled.type, payload: 1 };
    const s = collectionsReducer(
      { ...initialState, collections: [col] },
      action,
    );
    expect(s.collections).toHaveLength(0);
  });
});

describe("collectionsSlice — removeImageFromCollection", () => {
  it("removes image from collectionImages", () => {
    const img = {
      id: 1,
      collection_id: 1,
      image_id: "img1",
      image_url: "",
      image_thumb_url: "",
      image_small_url: "",
      photographer_name: "",
      photographer_username: "",
      photographer_avatar: "",
      published_at: null,
      created_at: "",
    };
    const action = {
      type: removeImageFromCollection.fulfilled.type,
      payload: { collectionId: 1, imageId: "img1" },
    };
    const s = collectionsReducer(
      { ...initialState, collectionImages: [img] },
      action,
    );
    expect(s.collectionImages).toHaveLength(0);
  });

  it("decrements image_count on parent collection", () => {
    const action = {
      type: removeImageFromCollection.fulfilled.type,
      payload: { collectionId: 1, imageId: "img1" },
    };
    const s = collectionsReducer(
      { ...initialState, collections: [col] },
      action,
    );
    expect(s.collections[0].image_count).toBe(1);
  });
});

describe("collectionsSlice — thunk integration", () => {
  beforeEach(() => (global.fetch as jest.Mock).mockReset());

  it("fetchCollections calls /api/collections", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [col],
    });
    const dispatch = jest.fn();
    await fetchCollections()(dispatch, () => ({}), undefined);
    expect(global.fetch).toHaveBeenCalledWith("/api/collections");
  });

  it("deleteCollection calls DELETE /api/collections/:id", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    const dispatch = jest.fn();
    await deleteCollection(1)(dispatch, () => ({}), undefined);
    expect(global.fetch).toHaveBeenCalledWith("/api/collections/1", {
      method: "DELETE",
    });
  });
});
