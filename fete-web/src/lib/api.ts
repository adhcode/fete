import type { Photo, Event, UploadIntentResponse, GetPhotosResponse, GetStoryResponse, Template } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getEvent(code: string): Promise<Event> {
    const res = await fetch(`${this.baseUrl}/events/${code}`);
    if (!res.ok) throw new Error('Event not found');
    return res.json();
  }

  async getTemplates(): Promise<Template[]> {
    const res = await fetch(`${this.baseUrl}/api/templates`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  }

  async getTemplate(id: string): Promise<Template> {
    const res = await fetch(`${this.baseUrl}/api/templates/${id}`);
    if (!res.ok) throw new Error('Template not found');
    return res.json();
  }

  async createUploadIntent(params: {
    eventCode: string;
    mediaType?: 'IMAGE' | 'VIDEO';
    contentType: string;
    fileSizeBytes?: number;
    caption?: string;
    uploaderHash?: string;
  }): Promise<UploadIntentResponse> {
    const res = await fetch(`${this.baseUrl}/api/upload-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        mediaType: params.mediaType || 'IMAGE',
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create upload intent');
    }
    return res.json();
  }

  async uploadToR2(url: string, file: File | Blob): Promise<void> {
    const contentType = file instanceof File ? file.type : 'image/jpeg';
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    });
    if (!res.ok) throw new Error('Failed to upload file');
  }

  async completeUpload(photoId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/upload-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId }),
    });
    if (!res.ok) throw new Error('Failed to complete upload');
  }

  async getEventPhotos(
    eventCode: string,
    params?: {
      limit?: number;
      cursor?: string;
      status?: string;
      approved?: boolean;
    }
  ): Promise<GetPhotosResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.status) query.set('status', params.status);
    if (params?.approved !== undefined) query.set('approved', params.approved.toString());

    const res = await fetch(
      `${this.baseUrl}/api/events/${eventCode}/photos?${query}`
    );
    if (!res.ok) throw new Error('Failed to fetch photos');
    return res.json();
  }

  async getPhoto(photoId: string): Promise<Photo & { event: { id: string; name: string; code: string } }> {
    const res = await fetch(`${this.baseUrl}/api/photos/${photoId}`);
    if (!res.ok) throw new Error('Photo not found');
    return res.json();
  }

  async getEventStory(
    eventCode: string,
    params?: {
      limit?: number;
      cursor?: string;
    }
  ): Promise<GetStoryResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.cursor) query.set('cursor', params.cursor);

    const res = await fetch(
      `${this.baseUrl}/api/events/${eventCode}/story?${query}`
    );
    if (!res.ok) throw new Error('Failed to fetch story');
    return res.json();
  }
}

export const api = new ApiClient(API_URL);
