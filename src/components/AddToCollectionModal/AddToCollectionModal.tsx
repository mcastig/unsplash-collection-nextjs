'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import styles from './AddToCollectionModal.module.css';
import { Collection } from '@/types';

interface Props {
  collections: Collection[];
  alreadyInCollectionIds: number[];
  onAdd: (collectionId: number) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export default function AddToCollectionModal({
  collections,
  alreadyInCollectionIds,
  onAdd,
  onCreateNew,
  onClose,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return collections.filter(c => {
      if (alreadyInCollectionIds.includes(c.id)) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [collections, alreadyInCollectionIds, query]);

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Add to Collections</h2>
        <div className={styles.searchWrapper}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search collections..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <span className={styles.searchIcon}>
            <Image src="/Search.svg" alt="" width={14} height={14} />
          </span>
        </div>
        {query && (
          <p className={styles.matchCount}>{filtered.length} match{filtered.length !== 1 ? 'es' : ''}</p>
        )}
        <div className={styles.list}>
          {filtered.length === 0 ? (
            <p className={styles.emptyText}>
              {query ? 'No collections match your search' : 'No available collections'}
            </p>
          ) : (
            filtered.map(col => {
              const coverUrl = col.cover_image?.image_thumb_url || col.cover_image?.image_url;
              return (
                <div key={col.id} className={styles.item}>
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.thumb} src={coverUrl} alt={col.name} />
                  ) : (
                    <div className={styles.thumbPlaceholder} />
                  )}
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{col.name}</p>
                    <p className={styles.itemCount}>{col.image_count ?? 0} photos</p>
                  </div>
                  <button className={styles.addBtn} onClick={() => onAdd(col.id)}>
                    <Image src="/Plus.svg" alt="" width={12} height={12} />
                    Add to Collection
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className={styles.footer}>
          <button className={styles.newBtn} onClick={onCreateNew}>
            <Image src="/Plus.svg" alt="" width={14} height={14} />
            New Collection
          </button>
        </div>
      </div>
    </div>
  );
}
