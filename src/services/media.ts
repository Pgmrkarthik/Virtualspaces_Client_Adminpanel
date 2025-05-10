import api from '../utils/api';
import type { MediaType, MediaItem, Booth } from '../types/media';

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

export const getBooths = async (): Promise<Booth[]> => {
  const response = await api.get('/booths');
  return response.data;
};

export const getBoothById = async (id: string): Promise<Booth> => {
  const response = await api.get(`/booths/${id}`);
  return response.data;
};

export const deleteMedia = async (id: string): Promise<void> => {
  await api.delete(`/admin/media/${id}`);
};