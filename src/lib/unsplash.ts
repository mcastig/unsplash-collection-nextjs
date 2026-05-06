import { UnsplashImage, UnsplashSearchResult } from '@/types';

const BASE_URL = 'https://api.unsplash.com';
const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY || '';

async function unsplashFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('client_id', ACCESS_KEY);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
  return res.json();
}

export async function searchPhotos(query: string, page = 1, perPage = 20): Promise<UnsplashSearchResult> {
  return unsplashFetch<UnsplashSearchResult>('/search/photos', {
    query,
    page: String(page),
    per_page: String(perPage),
  });
}

export async function getPhoto(id: string): Promise<UnsplashImage> {
  return unsplashFetch<UnsplashImage>(`/photos/${id}`);
}

export async function triggerDownload(downloadLocation: string): Promise<void> {
  const url = new URL(downloadLocation);
  url.searchParams.set('client_id', ACCESS_KEY);
  await fetch(url.toString());
}
