"use client";

import Image from "next/image";
import styles from "./SearchInput.module.css";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Enter your keywords...",
  autoFocus,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onSubmit()}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      <span className={styles.icon}>
        <Image src="/Search.svg" alt="search" width={16} height={16} />
      </span>
    </div>
  );
}
