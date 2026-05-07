import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <p className={`${styles.code} gradient-text`}>404</p>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.subtitle}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className={styles.homeBtn}>
        Go home
      </Link>
    </div>
  );
}
