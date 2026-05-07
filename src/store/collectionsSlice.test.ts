import collectionsReducer, {
  fetchCollections,
  fetchCollectionById,
  fetchCollectionImages,
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

  it("uses fallback error message when error.message is undefined", () => {
    const s = collectionsReducer(initialState, {
      type: fetchCollections.rejected.type,
      error: {},
    });
    expect(s.error).toBe("Error");
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

describe("collectionsSlice — fetchCollectionById reducer", () => {
  it("stores selectedCollection on fulfilled", () => {
    const s = collectionsReducer(initialState, {
      type: fetchCollectionById.fulfilled.type,
      payload: col,
    });
    expect(s.selectedCollection).toEqual(col);
  });
});

describe("collectionsSlice — fetchCollectionImages reducer", () => {
  it("sets imagesLoading on pending", () => {
    const s = collectionsReducer(initialState, {
      type: fetchCollectionImages.pending.type,
    });
    expect(s.imagesLoading).toBe(true);
  });

  it("stores collectionImages on fulfilled", () => {
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
    const s = collectionsReducer(initialState, {
      type: fetchCollectionImages.fulfilled.type,
      payload: [img],
    });
    expect(s.imagesLoading).toBe(false);
    expect(s.collectionImages).toHaveLength(1);
  });

  it("clears imagesLoading on rejected", () => {
    const s = collectionsReducer(
      { ...initialState, imagesLoading: true },
      { type: fetchCollectionImages.rejected.type },
    );
    expect(s.imagesLoading).toBe(false);
  });
});

describe("collectionsSlice — addImageToCollection reducer", () => {
  const img = {
    id: 5,
    collection_id: 1,
    image_id: "img5",
    image_url: "",
    image_thumb_url: "",
    image_small_url: "",
    photographer_name: "",
    photographer_username: "",
    photographer_avatar: "",
    published_at: null,
    created_at: "",
  };

  it("increments image_count on the collection", () => {
    const action = {
      type: addImageToCollection.fulfilled.type,
      payload: { collectionId: 1, image: img },
    };
    const s = collectionsReducer({ ...initialState, collections: [col] }, action);
    expect(s.collections[0].image_count).toBe(3);
  });

  it("increments image_count from 0 when image_count is undefined", () => {
    const colNoCount: Collection = { ...col, image_count: undefined };
    const action = {
      type: addImageToCollection.fulfilled.type,
      payload: { collectionId: 1, image: img },
    };
    const s = collectionsReducer(
      { ...initialState, collections: [colNoCount] },
      action,
    );
    expect(s.collections[0].image_count).toBe(1);
  });

  it("appends image to collectionImages when selectedCollection matches", () => {
    const action = {
      type: addImageToCollection.fulfilled.type,
      payload: { collectionId: 1, image: img },
    };
    const s = collectionsReducer(
      {
        ...initialState,
        collections: [col],
        selectedCollection: col,
        collectionImages: [],
      },
      action,
    );
    expect(s.collectionImages).toHaveLength(1);
  });

  it("does not append image when selectedCollection does not match", () => {
    const action = {
      type: addImageToCollection.fulfilled.type,
      payload: { collectionId: 99, image: img },
    };
    const s = collectionsReducer(
      {
        ...initialState,
        collections: [col],
        selectedCollection: col,
        collectionImages: [],
      },
      action,
    );
    expect(s.collectionImages).toHaveLength(0);
  });

  it("does nothing when collection not found in list", () => {
    const action = {
      type: addImageToCollection.fulfilled.type,
      payload: { collectionId: 999, image: img },
    };
    const s = collectionsReducer({ ...initialState, collections: [col] }, action);
    expect(s.collections[0].image_count).toBe(2);
  });
});

describe("collectionsSlice — removeImageFromCollection image_count guard", () => {
  it("does not decrement when image_count is 0", () => {
    const colZero: Collection = { ...col, image_count: 0 };
    const action = {
      type: removeImageFromCollection.fulfilled.type,
      payload: { collectionId: 1, imageId: "img1" },
    };
    const s = collectionsReducer(
      { ...initialState, collections: [colZero] },
      action,
    );
    expect(s.collections[0].image_count).toBe(0);
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

  it("fetchCollections rejects on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const dispatch = jest.fn();
    await fetchCollections()(dispatch, () => ({}), undefined);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchCollections.rejected.type }),
    );
  });

  it("fetchCollectionById calls /api/collections/:id", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => col,
    });
    const dispatch = jest.fn();
    await fetchCollectionById(1)(dispatch, () => ({}), undefined);
    expect(global.fetch).toHaveBeenCalledWith("/api/collections/1");
  });

  it("fetchCollectionById rejects on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const dispatch = jest.fn();
    await fetchCollectionById(1)(dispatch, () => ({}), undefined);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchCollectionById.rejected.type }),
    );
  });

  it("fetchCollectionImages calls /api/collections/:id/images", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    const dispatch = jest.fn();
    await fetchCollectionImages(1)(dispatch, () => ({}), undefined);
    expect(global.fetch).toHaveBeenCalledWith("/api/collections/1/images");
  });

  it("fetchCollectionImages rejects on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const dispatch = jest.fn();
    await fetchCollectionImages(1)(dispatch, () => ({}), undefined);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchCollectionImages.rejected.type }),
    );
  });

  it("createCollection posts to /api/collections", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => col,
    });
    const dispatch = jest.fn();
    await createCollection("Nature")(dispatch, () => ({}), undefined);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/collections",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("createCollection rejects on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const dispatch = jest.fn();
    await createCollection("Bad")(dispatch, () => ({}), undefined);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: createCollection.rejected.type }),
    );
  });

  it("addImageToCollection posts to /api/collections/:id/images", async () => {
    const imageData = {
      image_id: "img1",
      image_url: "",
      image_thumb_url: "",
      image_small_url: "",
      photographer_name: "",
      photographer_username: "",
      photographer_avatar: "",
      published_at: null,
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 5, collection_id: 1, ...imageData, created_at: "" }),
    });
    const dispatch = jest.fn();
    await addImageToCollection({ collectionId: 1, imageData })(
      dispatch,
      () => ({}),
      undefined,
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/collections/1/images",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("addImageToCollection rejects on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const dispatch = jest.fn();
    await addImageToCollection({
      collectionId: 1,
      imageData: {
        image_id: "x",
        image_url: "",
        image_thumb_url: "",
        image_small_url: "",
        photographer_name: "",
        photographer_username: "",
        photographer_avatar: "",
        published_at: null,
      },
    })(dispatch, () => ({}), undefined);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: addImageToCollection.rejected.type }),
    );
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

  it("deleteCollection rejects on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const dispatch = jest.fn();
    await deleteCollection(1)(dispatch, () => ({}), undefined);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: deleteCollection.rejected.type }),
    );
  });

  it("removeImageFromCollection calls DELETE /api/collections/:id/images/:imageId", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    const dispatch = jest.fn();
    await removeImageFromCollection({ collectionId: 1, imageId: "img1" })(
      dispatch,
      () => ({}),
      undefined,
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/collections/1/images/img1",
      { method: "DELETE" },
    );
  });

  it("removeImageFromCollection rejects on non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const dispatch = jest.fn();
    await removeImageFromCollection({ collectionId: 1, imageId: "img1" })(
      dispatch,
      () => ({}),
      undefined,
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: removeImageFromCollection.rejected.type }),
    );
  });
});
