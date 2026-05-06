"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import SearchInput from "@/components/SearchInput/SearchInput";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setQuery, searchPhotos } from "@/store/searchSlice";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { query } = useAppSelector((s) => s.search);
  const [localQuery, setLocalQuery] = useState(query);

  const handleSearch = () => {
    if (!localQuery.trim()) return;
    dispatch(setQuery(localQuery));
    dispatch(searchPhotos({ query: localQuery, page: 1 }));
    router.push(`/search?q=${encodeURIComponent(localQuery)}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.center}>
        <h1 className={styles.title}>Search</h1>
        <p className={styles.subtitle}>
          Search high-resolution images from Unsplash
        </p>
        <SearchInput
          value={localQuery}
          onChange={setLocalQuery}
          onSubmit={handleSearch}
          autoFocus
        />
      </div>
    </div>
  );
}
