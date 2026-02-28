import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Event, Photo } from '../types';
import { getUploaderHash } from '../lib/storage';
import CameraView from '../components/CameraViewWithTemplate';
import Gallery from '../components/Gallery';
import StoryViewer from '../components/StoryViewer';

type View = 'camera' | 'gallery' | 'stories';

export default function EventPageNew() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [storyMedia, setStoryMedia] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('camera');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [storyNextCursor, setStoryNextCursor] = useState<string | null>(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

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
    }
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

  async function handleUploadComplete() {
    await Promise.all([loadPhotos(), loadStory()]);
  }

  function handleLoadMore() {
    if (nextCursor) {
      loadPhotos(nextCursor);
    }
  }

  function handleLoadMoreStory() {
    if (storyNextCursor) {
      loadStory(storyNextCursor);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'This event does not exist'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white text-black rounded-full font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Main content area */}
      <div className="absolute inset-0">
        {currentView === 'camera' && (
          <CameraView
            event={event}
            uploaderHash={getUploaderHash()}
            onUploadComplete={handleUploadComplete}
          />
        )}

        {currentView === 'gallery' && (
          <div className="w-full h-full overflow-y-auto bg-black">
            <div className="p-4">
              <h2 className="text-2xl font-bold text-white mb-6">Gallery</h2>
              <Gallery
                photos={photos}
                onLoadMore={nextCursor ? handleLoadMore : undefined}
                loadingMore={false}
              />
            </div>
          </div>
        )}

        {currentView === 'stories' && storyMedia.length > 0 && (
          <StoryViewer
            media={storyMedia}
            initialIndex={0}
            onClose={() => setCurrentView('camera')}
            onLoadMore={storyNextCursor ? handleLoadMoreStory : undefined}
          />
        )}

        {currentView === 'stories' && storyMedia.length === 0 && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-6">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400">No stories yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-white hover:bg-white/20 rounded-full transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-lg">{event.name}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-6 pt-4 px-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Gallery */}
          <button
            onClick={() => setCurrentView('gallery')}
            className="flex flex-col items-center gap-1.5 transition-all"
          >
            <div className={`p-3 rounded-2xl transition-all ${
              currentView === 'gallery' ? 'bg-white/20 scale-110' : 'bg-transparent'
            }`}>
              <svg className={`w-7 h-7 transition-colors ${
                currentView === 'gallery' ? 'text-white' : 'text-white/60'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className={`text-xs font-semibold transition-colors ${
              currentView === 'gallery' ? 'text-white' : 'text-white/60'
            }`}>Gallery</span>
          </button>

          {/* Camera (always active) */}
          <button
            onClick={() => setCurrentView('camera')}
            className="flex flex-col items-center gap-1.5 transition-all"
          >
            <div className={`p-3 rounded-2xl transition-all ${
              currentView === 'camera' ? 'bg-white/20 scale-110' : 'bg-transparent'
            }`}>
              <svg className={`w-7 h-7 transition-colors ${
                currentView === 'camera' ? 'text-white' : 'text-white/60'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className={`text-xs font-semibold transition-colors ${
              currentView === 'camera' ? 'text-white' : 'text-white/60'
            }`}>Camera</span>
          </button>

          {/* Stories */}
          <button
            onClick={() => setCurrentView('stories')}
            className="flex flex-col items-center gap-1.5 transition-all relative"
          >
            <div className={`p-3 rounded-2xl transition-all ${
              currentView === 'stories' ? 'bg-white/20 scale-110' : 'bg-transparent'
            }`}>
              <svg className={`w-7 h-7 transition-colors ${
                currentView === 'stories' ? 'text-white' : 'text-white/60'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`text-xs font-semibold transition-colors ${
              currentView === 'stories' ? 'text-white' : 'text-white/60'
            }`}>Stories</span>
            {storyMedia.length > 0 && (
              <div className="absolute -top-1 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                <span className="text-white text-[10px] font-bold">{storyMedia.length}</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Story viewer overlay */}
      {showStoryViewer && storyMedia.length > 0 && (
        <StoryViewer
          media={storyMedia}
          initialIndex={0}
          onClose={() => setShowStoryViewer(false)}
          onLoadMore={storyNextCursor ? handleLoadMoreStory : undefined}
        />
      )}
    </div>
  );
}
