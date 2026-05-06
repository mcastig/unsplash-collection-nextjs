import Link from "next/link";
import styles from "./CollectionCard.module.css";
import { Collection } from "@/types";

interface Props {
  collection: Collection;
  onDelete?: (id: number) => void;
}

export default function CollectionCard({ collection, onDelete }: Props) {
  const coverUrl =
    collection.cover_image?.image_url ||
    collection.cover_image?.image_small_url;

  return (
    <div className={styles.wrapper}>
      <Link href={`/collections/${collection.id}`} className={styles.card}>
        <div className={styles.imageWrapper}>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.coverImg}
              src={coverUrl}
              alt={collection.name}
            />
          ) : (
            <div className={styles.placeholder} />
          )}
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{collection.name}</h3>
          <p className={styles.count}>{collection.image_count ?? 0} photos</p>
        </div>
      </Link>

      {onDelete && (
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.preventDefault();
            onDelete(collection.id);
          }}
          aria-label={`Delete ${collection.name}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      )}
    </div>
  );
}
