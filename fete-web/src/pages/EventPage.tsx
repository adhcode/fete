import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Event, Photo } from '../types';
import { getUploaderHash } from '../lib/storage';
import UploadSection from '../components/UploadSection';
import Gallery from '../components/Gallery';
import StoryViewer from '../components/StoryViewer';

export default function EventPage() {
  const { code } = useParams<{ code: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [storyMedia, setStoryMedia] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [storyNextCursor, setStoryNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    if (!code) return;
    loadEvent();
    loadPhotos();
    loadStory();
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
    // Reload photos and story after upload
    await Promise.all([loadPhotos(), loadStory()]);
  }

  async function loadStory(cursor?: string) {
    try {
      const data = await api.getEventStory(code!, {
        limit: 30,
        cursor,
      });

      if (cursor) {
        setStoryMedia(prev => [...prev, ...data.data]);
      } else {
        setStoryMedia(data.data);
      }

      setStoryNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error('Failed to load story:', err);
    }
  }

  function handleOpenStory(index: number) {
    setStoryIndex(index);
    setShowStory(true);
  }

  function handleLoadMoreStory() {
    if (storyNextCursor) {
      loadStory(storyNextCursor);
    }
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

        {storyMedia.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Story</h2>
              <button
                onClick={() => handleOpenStory(0)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4">
              {storyMedia.slice(0, 10).map((media, idx) => (
                <button
                  key={media.id}
                  onClick={() => handleOpenStory(idx)}
                  className="flex-shrink-0 relative"
                >
                  <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-blue-500">
                    {media.mediaType === 'VIDEO' ? (
                      <img
                        src={(media as any).posterUrl}
                        alt={media.caption || 'Video'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={(media as any).thumbUrl}
                        alt={media.caption || 'Photo'}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {media.mediaType === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-2">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
          <Gallery
            photos={photos}
            onLoadMore={nextCursor ? handleLoadMore : undefined}
            loadingMore={loadingMore}
          />
        </div>
      </main>

      {showStory && (
        <StoryViewer
          media={storyMedia}
          initialIndex={storyIndex}
          onClose={() => setShowStory(false)}
          onLoadMore={storyNextCursor ? handleLoadMoreStory : undefined}
        />
      )}
    </div>
  );
}
