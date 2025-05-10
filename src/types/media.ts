export type MediaType = 'audio' | 'video' | 'image' | 'pdf';

export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
  boothId: string;
  position: string;
  createdAt: string;
}

export interface Booth {
  id: string;
  name: string;
  medias: {
    audio: MediaItem[];
    video: MediaItem[];
    image: MediaItem[];
    pdf: MediaItem[];
  };
}