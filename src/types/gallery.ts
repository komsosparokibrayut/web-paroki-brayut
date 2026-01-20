export interface AlbumImage {
  src: string;
  width: number;
  height: number;
}

export interface Album {
  id: string; // The slug/filename without extension
  title: string;
  date: string; // ISO date string
  description: string;
  coverImage?: string; 
  images: AlbumImage[];
}
