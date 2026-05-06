"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./search.module.css";
import SearchInput from "@/components/SearchInput/SearchInput";
import ImageGrid from "@/components/ImageGrid/ImageGrid";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { searchPhotos, setQuery } from "@/store/searchSlice";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { results, loading, error, query } = useAppSelector((s) => s.search);
  const [localQuery, setLocalQuery] = useState(
    query || searchParams.get("q") || "",
  );

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) {
      setLocalQuery(q);
      dispatch(setQuery(q));
      dispatch(searchPhotos({ query: q, page: 1 }));
    } else if (q && results.length === 0) {
      dispatch(searchPhotos({ query: q, page: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = () => {
    if (!localQuery.trim()) return;
    dispatch(setQuery(localQuery));
    dispatch(searchPhotos({ query: localQuery, page: 1 }));
    router.push(`/search?q=${encodeURIComponent(localQuery)}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.searchBanner}></div>

      <div className={styles.searchBannerMiddle}>
        <SearchInput
          value={localQuery}
          onChange={setLocalQuery}
          onSubmit={handleSearch}
        />
      </div>

      {loading && (
        <div className={styles.status}>
          <div className={styles.spinner} />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && results.length > 0 && <ImageGrid images={results} />}

      {!loading && !error && results.length === 0 && query && (
        <p className={styles.empty}>
          No results found for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
