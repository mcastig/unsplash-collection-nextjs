import styles from "./ImageGrid.module.css";
import ImageCard from "@/components/ImageCard/ImageCard";
import { UnsplashImage } from "@/types";

interface Props {
  images: UnsplashImage[];
}

export default function ImageGrid({ images }: Props) {
  return (
    <div className={styles.grid}>
      {images.map((img) => (
        <div key={img.id} className={styles.item}>
          <ImageCard image={img} style={{ height: "auto" }} />
        </div>
      ))}
    </div>
  );
}
