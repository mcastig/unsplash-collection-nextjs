CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_images (
  id SERIAL PRIMARY KEY,
  collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
  image_id VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  image_thumb_url TEXT NOT NULL,
  image_small_url TEXT NOT NULL,
  photographer_name VARCHAR(255),
  photographer_username VARCHAR(255),
  photographer_avatar TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(collection_id, image_id)
);
