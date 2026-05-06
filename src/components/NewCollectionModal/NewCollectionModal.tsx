"use client";

import { useState } from "react";
import styles from "./NewCollectionModal.module.css";

interface Props {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export default function NewCollectionModal({ onSave, onCancel }: Props) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) onSave(name.trim());
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>Add Collection</h2>
        <input
          className={styles.input}
          type="text"
          placeholder="Collection name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && handleSave()}
          autoFocus
        />
        <div className={styles.actions}>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save
          </button>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
