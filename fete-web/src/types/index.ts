export interface Photo {
  id: string;
  caption?: string;
  status: 'PENDING_UPLOAD' | 'UPLOADED' | 'PROCESSED' | 'FAILED';
  approved: boolean;
  width?: number;
  height?: number;
  largeUrl?: string;
  thumbUrl?: string;
  createdAt: string;
}

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
