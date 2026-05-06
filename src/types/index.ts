export interface UnsplashUser {
  id: string;
  name: string;
  username: string;
  profile_image: {
    small: string;
    medium: string;
    large: string;
  };
  links: {
    html: string;
  };
}

export interface UnsplashImage {
  id: string;
  created_at: string;
  width: number;
  height: number;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    html: string;
    download: string;
    download_location: string;
  };
  user: UnsplashUser;
}

export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

export interface Collection {
  id: number;
  name: string;
  created_at: string;
  cover_image?: CollectionImage | null;
  image_count?: number;
}

export interface CollectionImage {
  id: number;
  collection_id: number;
  image_id: string;
  image_url: string;
  image_thumb_url: string;
  image_small_url: string;
  photographer_name: string;
  photographer_username: string;
  photographer_avatar: string;
  published_at: string | null;
  created_at: string;
}
