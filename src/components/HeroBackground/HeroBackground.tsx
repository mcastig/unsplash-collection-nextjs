"use client";

import styles from "./HeroBackground.module.css";
import { UnsplashImage } from "@/types";

interface Props {
  images?: UnsplashImage[];
}

const GRID_COLS = 12;
const GRID_ROWS = 6;
const TOTAL = GRID_COLS * GRID_ROWS;

// Positions in the left and right flanks (columns 0-2 and 9-11) to show images
const IMAGE_POSITIONS = new Set([
  1, 13, 25, 37, 49, 61, 10, 22, 34, 46, 58, 70,
]);

export default function HeroBackground({ images = [] }: Props) {
  const tiles = Array.from({ length: TOTAL }, (_, i) => {
    const imgIndex = [...IMAGE_POSITIONS].indexOf(i);
    const image = imgIndex >= 0 && images[imgIndex] ? images[imgIndex] : null;
    return { key: i, image };
  });

  return (
    <div className={styles.hero} aria-hidden="true">
      <div className={styles.grid}>
        {tiles.map(({ key, image }) => (
          <div key={key} className={styles.tile}>
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.urls.thumb} alt="" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
