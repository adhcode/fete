export type MediaType = 'IMAGE' | 'VIDEO';

export interface Media {
  id: string;
  caption?: string;
  status: 'PENDING_UPLOAD' | 'UPLOADED' | 'PROCESSED' | 'FAILED';
  approved: boolean;
  mediaType: MediaType;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface ImageMedia extends Media {
  mediaType: 'IMAGE';
  largeUrl?: string;
  thumbUrl?: string;
}

export interface VideoMedia extends Media {
  mediaType: 'VIDEO';
  playbackUrl?: string;
  posterUrl?: string;
  durationSec?: number;
}

export type Photo = ImageMedia | VideoMedia;

export interface Event {
  id: string;
  code: string;
  name: string;
  date?: string;
  venue?: string;
  approvalRequired: boolean;
  publicGallery: boolean;
  allowShareLinks: boolean;
  maxUploadsPerGuest?: number;
  maxUploadsTotal?: number;
}

export interface UploadIntentResponse {
  photoId: string;
  uploadUrl: string;
}

export interface GetPhotosResponse {
  data: Photo[];
  nextCursor?: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetStoryResponse {
  data: Photo[];
  nextCursor?: string | null;
}
