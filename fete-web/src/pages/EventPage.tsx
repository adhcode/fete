import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Event, Photo } from '../types';
import { getUploaderHash } from '../lib/storage';
import UploadSection from '../components/UploadSection';
import Gallery from '../components/Gallery';

export default function EventPage() {
  const { code } = useParams<{ code: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!code) return;
    loadEvent();
    loadPhotos();
  }, [code]);

  async function loadEvent() {
    try {
      const data = await api.getEvent(code!);
      setEvent(data);
    } catch (err) {
      setError('Event not found');
    } finally {
      setLoading(false);
    }
  }

  async function loadPhotos(cursor?: string) {
    try {
      const data = await api.getEventPhotos(code!, {
        limit: 30,
        cursor,
        status: 'PROCESSED',
      });
      
      if (cursor) {
        setPhotos(prev => [...prev, ...data.data]);
      } else {
        setPhotos(data.data);
      }
      
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleUploadComplete() {
    // Reload photos after upload
    await loadPhotos();
  }

  function handleLoadMore() {
    if (nextCursor && !loadingMore) {
      setLoadingMore(true);
      loadPhotos(nextCursor);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">{error || 'This event does not exist'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
          {event.venue && <p className="text-gray-600 mt-1">{event.venue}</p>}
          {event.date && (
            <p className="text-sm text-gray-500 mt-1">
              {new Date(event.date).toLocaleDateString()}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">Event Code: <span className="font-mono font-semibold">{event.code}</span></p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <UploadSection
          eventCode={event.code}
          uploaderHash={getUploaderHash()}
          onUploadComplete={handleUploadComplete}
        />

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
          <Gallery
            photos={photos}
            onLoadMore={nextCursor ? handleLoadMore : undefined}
            loadingMore={loadingMore}
          />
        </div>
      </main>
    </div>
  );
}
