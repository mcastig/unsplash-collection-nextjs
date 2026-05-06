import imageReducer, {
  clearImage,
  removeCollectionFromImage,
  addCollectionToImage,
  fetchImageDetail,
  fetchImageCollections,
} from "./imageSlice";

const initialState = {
  currentImage: null,
  imageCollections: [],
  loading: false,
  error: null,
};

const mockImage = {
  id: "abc",
  created_at: "2024-01-01",
  width: 800,
  height: 600,
  description: null,
  alt_description: null,
  urls: { raw: "", full: "", regular: "", small: "", thumb: "" },
  links: { html: "", download: "", download_location: "" },
  user: {
    id: "u1",
    name: "Test",
    username: "test",
    profile_image: { small: "", medium: "", large: "" },
    links: { html: "" },
  },
};

describe("imageSlice — reducers", () => {
  it("returns initial state", () => {
    expect(imageReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("clearImage resets state", () => {
    const dirty = {
      ...initialState,
      currentImage: mockImage as never,
      imageCollections: [{} as never],
    };
    const s = imageReducer(dirty, clearImage());
    expect(s.currentImage).toBeNull();
    expect(s.imageCollections).toEqual([]);
  });

  it("removeCollectionFromImage filters by collectionId", () => {
    const entry = { collectionId: 1, collectionName: "A", entry: {} as never };
    const s = imageReducer(
      { ...initialState, imageCollections: [entry] },
      removeCollectionFromImage(1),
    );
    expect(s.imageCollections).toHaveLength(0);
  });

  it("addCollectionToImage appends entry", () => {
    const entry = { collectionId: 2, collectionName: "B", entry: {} as never };
    const s = imageReducer(initialState, addCollectionToImage(entry));
    expect(s.imageCollections).toHaveLength(1);
    expect(s.imageCollections[0].collectionId).toBe(2);
  });
});

describe("imageSlice — async thunks", () => {
  it("sets loading on fetchImageDetail pending", () => {
    const s = imageReducer(initialState, {
      type: fetchImageDetail.pending.type,
    });
    expect(s.loading).toBe(true);
  });

  it("stores image on fetchImageDetail fulfilled", () => {
    const s = imageReducer(initialState, {
      type: fetchImageDetail.fulfilled.type,
      payload: mockImage,
    });
    expect(s.currentImage).toEqual(mockImage);
    expect(s.loading).toBe(false);
  });

  it("stores imageCollections on fetchImageCollections fulfilled", () => {
    const payload = [{ collectionId: 1, collectionName: "X", entry: {} }];
    const s = imageReducer(initialState, {
      type: fetchImageCollections.fulfilled.type,
      payload,
    });
    expect(s.imageCollections).toEqual(payload);
  });
});
