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

export interface Template {
  id: string;
  name: string;
  overlayUrl?: string;
  previewUrl?: string;
  config: TemplateConfig;
}

export interface TemplateConfig {
  version: string;
  overlay: {
    url?: string;
    opacity: number;
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  };
  textFields: TextField[];
  safeArea?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface TextField {
  id: string;
  defaultValue: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  maxWidth?: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  align: 'left' | 'center' | 'right';
  shadow?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

export interface Event {
  id: string;
  code: string;
  name: string;
  date?: string;
  venue?: string;
  hashtag?: string;
  approvalRequired: boolean;
  publicGallery: boolean;
  allowShareLinks: boolean;
  maxUploadsPerGuest?: number;
  maxUploadsTotal?: number;
  template?: Template;
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
