'use client';

import Link from 'next/link';
import styles from './ImageCard.module.css';
import { UnsplashImage } from '@/types';

interface Props {
  image: UnsplashImage;
  style?: React.CSSProperties;
}

export default function ImageCard({ image, style }: Props) {
  return (
    <Link href={`/images/${image.id}`} className={styles.card} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.urls.small}
        alt={image.alt_description || image.description || 'Unsplash photo'}
        loading="lazy"
      />
      <div className={styles.overlay} />
      <div className={styles.info}>
        <p className={styles.authorName}>{image.user.name}</p>
      </div>
    </Link>
  );
}
