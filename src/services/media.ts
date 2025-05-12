import api from '../utils/api';
import type { MediaType, MediaItem, Booth } from '../types/media';
import { BOOTHID } from '../utils/data';

export const uploadMedia = async (
  mediaType: MediaType,
  boothId: string,
  position: string,
  file: File
): Promise<MediaItem> => {
  const formData = new FormData();
  formData.append('MediaType', mediaType);
  formData.append('BoothId', boothId);
  formData.append('Position', position);
  formData.append('file', file);

  const response = await api.post('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export async function getBooths(): Promise<Booth[]> {

  const mediaItems: MediaItem[] = await api.get(`/booths/booth/${BOOTHID}`).then(res =>{
    console.log(res);
    return res.data;

  });

  const boothsMap: Record<string, Booth> = {};

  for (const item of mediaItems) {
    const boothId = item.boothId;
    const type = item.mediaType.toUpperCase() as keyof Booth['medias'];

    if (!boothsMap[boothId]) {
      boothsMap[boothId] = {
        id: boothId,
        medias: {
          AUDIO: [],
          VIDEO: [],
          IMAGE: [],
          PDF: [],
        },
      };
    }

    boothsMap[boothId].medias[type].push(item);
  }

  return Object.values(boothsMap);
}

export const getBoothById = async (id: string): Promise<Booth> => {
  const response = await api.get(`/booths/${id}`);
  return response.data;
};

export const deleteMedia = async (id: string): Promise<void> => {
  await api.delete(`/admin/media/${id}`);
};