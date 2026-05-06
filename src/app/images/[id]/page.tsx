'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './image.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchImageDetail, fetchImageCollections, removeCollectionFromImage, addCollectionToImage } from '@/store/imageSlice';
import { fetchCollections, createCollection, addImageToCollection, removeImageFromCollection } from '@/store/collectionsSlice';
import AddToCollectionModal from '@/components/AddToCollectionModal/AddToCollectionModal';
import NewCollectionModal from '@/components/NewCollectionModal/NewCollectionModal';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ImageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentImage, imageCollections, loading } = useAppSelector(s => s.image);
  const { collections } = useAppSelector(s => s.collections);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    dispatch(fetchImageDetail(id));
    dispatch(fetchImageCollections(id));
    dispatch(fetchCollections());
  }, [id, dispatch]);

  const handleDownload = () => {
    if (!currentImage) return;
    const a = document.createElement('a');
    a.href = currentImage.urls.full;
    a.download = `unsplash-${id}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAddToCollection = async (collectionId: number) => {
    if (!currentImage) return;
    const imageData = {
      image_id: currentImage.id,
      image_url: currentImage.urls.regular,
      image_thumb_url: currentImage.urls.thumb,
      image_small_url: currentImage.urls.small,
      photographer_name: currentImage.user.name,
      photographer_username: currentImage.user.username,
      photographer_avatar: currentImage.user.profile_image.small,
      published_at: currentImage.created_at,
    };
    const result = await dispatch(addImageToCollection({ collectionId, imageData }));
    if (result.meta.requestStatus === 'fulfilled') {
      const col = collections.find(c => c.id === collectionId);
      if (col) {
        dispatch(addCollectionToImage({
          collectionId,
          collectionName: col.name,
          entry: { ...imageData, id: 0, collection_id: collectionId, created_at: new Date().toISOString() },
        }));
      }
      setShowAddModal(false);
      dispatch(fetchImageCollections(id));
      dispatch(fetchCollections());
    }
  };

  const handleRemove = async (collectionId: number) => {
    if (!currentImage) return;
    const result = await dispatch(removeImageFromCollection({ collectionId, imageId: currentImage.id }));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(removeCollectionFromImage(collectionId));
      dispatch(fetchCollections());
    }
  };

  const handleCreateCollection = async (name: string) => {
    const result = await dispatch(createCollection(name));
    if (result.meta.requestStatus === 'fulfilled') {
      setShowNewModal(false);
      setShowAddModal(true);
      dispatch(fetchCollections());
    }
  };

  const alreadyInIds = imageCollections.map(ic => ic.collectionId);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!currentImage) return null;

  return (
    <div className={styles.page}>
      <div className={styles.imageWrapper}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.mainImage}
          src={currentImage.urls.regular}
          alt={currentImage.alt_description || 'Unsplash photo'}
        />
      </div>

      <div className={styles.panel}>
        <div className={styles.author}>
          {currentImage.user.profile_image.medium && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.avatar}
              src={currentImage.user.profile_image.medium}
              alt={currentImage.user.name}
            />
          )}
          <div>
            <p className={styles.authorName}>{currentImage.user.name}</p>
            <p className={styles.publishedDate}>Published {formatDate(currentImage.created_at)}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
            <Image src="/Plus.svg" alt="" width={14} height={14} />
            Add to Collection
          </button>
          <button className={styles.downloadBtn} onClick={handleDownload}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
        </div>

        <div className={styles.collections}>
          <h2 className={styles.collectionsTitle}>Collections</h2>
          {imageCollections.length === 0 ? (
            <p className={styles.noCollections}>Not in any collection yet.</p>
          ) : (
            <ul className={styles.collectionList}>
              {imageCollections.map(ic => (
                <li key={ic.collectionId} className={styles.collectionItem}>
                  {ic.entry.image_thumb_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.colThumb} src={ic.entry.image_thumb_url} alt="" />
                  ) : (
                    <div className={styles.colThumbPlaceholder} />
                  )}
                  <div className={styles.colInfo}>
                    <p className={styles.colName}>{ic.collectionName}</p>
                    <p className={styles.colCount}>
                      {collections.find(c => c.id === ic.collectionId)?.image_count ?? 0} photos
                    </p>
                  </div>
                  <button className={styles.removeBtn} onClick={() => handleRemove(ic.collectionId)}>
                    <Image src="/Remove.svg" alt="" width={14} height={14} />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddToCollectionModal
          collections={collections}
          alreadyInCollectionIds={alreadyInIds}
          onAdd={handleAddToCollection}
          onCreateNew={() => { setShowAddModal(false); setShowNewModal(true); }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showNewModal && (
        <NewCollectionModal
          onSave={handleCreateCollection}
          onCancel={() => { setShowNewModal(false); setShowAddModal(true); }}
        />
      )}
    </div>
  );
}
