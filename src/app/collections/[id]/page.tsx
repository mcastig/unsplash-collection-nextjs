"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./collection-detail.module.css";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCollectionById,
  fetchCollectionImages,
} from "@/store/collectionsSlice";
import { UnsplashImage } from "@/types";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { selectedCollection, collectionImages, imagesLoading } =
    useAppSelector((s) => s.collections);

  useEffect(() => {
    dispatch(fetchCollectionById(Number(id)));
    dispatch(fetchCollectionImages(Number(id)));
  }, [id, dispatch]);

  const toUnsplashImage = (
    ci: import("@/types").CollectionImage,
  ): UnsplashImage => ({
    id: ci.image_id,
    created_at: ci.published_at || ci.created_at,
    width: 0,
    height: 0,
    description: null,
    alt_description: null,
    urls: {
      raw: ci.image_url,
      full: ci.image_url,
      regular: ci.image_url,
      small: ci.image_small_url,
      thumb: ci.image_thumb_url,
    },
    links: { html: "", download: "", download_location: "" },
    user: {
      id: "",
      name: ci.photographer_name || "",
      username: ci.photographer_username || "",
      profile_image: {
        small: ci.photographer_avatar || "",
        medium: "",
        large: "",
      },
      links: { html: "" },
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        {selectedCollection && (
          <>
            <h1 className={`${styles.title} gradient-text`}>
              {selectedCollection.name}
            </h1>
            <p className={styles.count}>
              {selectedCollection.image_count ?? 0} photos
            </p>
          </>
        )}
      </div>

      {imagesLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : collectionImages.length === 0 ? (
        <div className={styles.empty}>
          <p>This collection is empty.</p>
          <Link href="/" className={styles.browseLink}>
            Browse images to add
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {collectionImages.map((ci) => (
            <div key={ci.id} className={styles.item}>
              <Link href={`/images/${ci.image_id}`} className={styles.imgLink}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ci.image_small_url || ci.image_url}
                  alt={ci.photographer_name || ""}
                  className={styles.img}
                  loading="lazy"
                />
                <div className={styles.overlay}>
                  <span className={styles.authorOverlay}>
                    {ci.photographer_name}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
