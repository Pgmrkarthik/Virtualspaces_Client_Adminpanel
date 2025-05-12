export type MediaType = 'AUDIO' | 'VIDEO' | 'IMAGE' | 'PDF';

export interface MediaItem {
  id: string;
  fileurl: string;
  mediaType: MediaType;
  boothId: string;
  mediaPosition: string;
  createdAt: string;
}

export interface Booth {
  id: string;
  name?: string;
  medias: {
    AUDIO: MediaItem[];
    VIDEO: MediaItem[];
    IMAGE: MediaItem[];
    PDF: MediaItem[];
  };
}