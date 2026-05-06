'use client';

import { useEffect, useState } from 'react';
import styles from './collections.module.css';
import CollectionCard from '@/components/CollectionCard/CollectionCard';
import NewCollectionModal from '@/components/NewCollectionModal/NewCollectionModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCollections, createCollection, deleteCollection } from '@/store/collectionsSlice';
import Image from 'next/image';

export default function CollectionsPage() {
  const dispatch = useAppDispatch();
  const { collections, loading } = useAppSelector(s => s.collections);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  const handleCreate = async (name: string) => {
    await dispatch(createCollection(name));
    setShowNewModal(false);
  };

  const handleDelete = (id: number) => {
    dispatch(deleteCollection(id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={`${styles.title} gradient-text`}>Collections</h1>
        <p className={styles.subtitle}>
          Explore the world through collections of beautiful photos free to use under the{' '}
          <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className={styles.link}>
            Unsplash License
          </a>
        </p>
        <button className={styles.newBtn} onClick={() => setShowNewModal(true)}>
          <Image src="/Plus.svg" alt="" width={14} height={14} />
          New Collection
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : collections.length === 0 ? (
        <div className={styles.empty}>
          <p>No collections yet.</p>
          <button className={styles.emptyBtn} onClick={() => setShowNewModal(true)}>Create your first collection</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {collections.map(col => (
            <CollectionCard key={col.id} collection={col} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showNewModal && (
        <NewCollectionModal onSave={handleCreate} onCancel={() => setShowNewModal(false)} />
      )}
    </div>
  );
}
