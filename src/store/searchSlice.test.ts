import searchReducer, {
  setQuery,
  clearResults,
  searchPhotos,
} from "./searchSlice";

const initialState = {
  query: "",
  results: [],
  total: 0,
  totalPages: 0,
  page: 1,
  loading: false,
  error: null,
  hasSearched: false,
};

describe("searchSlice — reducers", () => {
  it("returns initial state", () => {
    expect(searchReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("setQuery updates query", () => {
    const state = searchReducer(initialState, setQuery("nature"));
    expect(state.query).toBe("nature");
  });

  it("clearResults resets search state", () => {
    const dirty = {
      ...initialState,
      query: "x",
      results: [{} as never],
      hasSearched: true,
    };
    const state = searchReducer(dirty, clearResults());
    expect(state.results).toEqual([]);
    expect(state.hasSearched).toBe(false);
    expect(state.total).toBe(0);
  });
});

describe("searchSlice — async thunks", () => {
  beforeEach(() => (global.fetch as jest.Mock).mockReset());

  it("sets loading on pending", () => {
    const state = searchReducer(initialState, {
      type: searchPhotos.pending.type,
    });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("stores results on fulfilled", () => {
    const payload = { results: [{ id: "1" }], total: 1, total_pages: 1 };
    const action = {
      type: searchPhotos.fulfilled.type,
      payload,
      meta: { arg: { page: 1 } },
    };
    const state = searchReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.results).toHaveLength(1);
    expect(state.hasSearched).toBe(true);
  });

  it("stores error on rejected", () => {
    const action = {
      type: searchPhotos.rejected.type,
      error: { message: "fail" },
    };
    const state = searchReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe("fail");
  });

  it("dispatches fulfilled when fetch succeeds", async () => {
    const payload = { results: [{ id: "abc" }], total: 1, total_pages: 1 };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    });
    const dispatch = jest.fn();
    const thunk = searchPhotos({ query: "nature", page: 1 });
    await thunk(dispatch, () => ({}), undefined);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: searchPhotos.fulfilled.type }),
    );
  });

  it("dispatches rejected when fetch fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const dispatch = jest.fn();
    await searchPhotos({ query: "x" })(dispatch, () => ({}), undefined);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: searchPhotos.rejected.type }),
    );
  });
});
