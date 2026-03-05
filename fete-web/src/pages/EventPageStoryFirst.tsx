import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { Event, Photo } from '../types';
import { getUploaderHash } from '../lib/storage';
import { getGuestId } from '../lib/guestId';
import { deriveThemeFromTemplate } from '../lib/theme';
import ThemeProvider from '../components/ThemeProvider';
import StoryRow, { type StoryHead } from '../components/StoryRow';
import StoryViewer from '../components/StoryViewer';
import FloatingCameraButton from '../components/FloatingCameraButton';
import RecentMomentsGrid from '../components/RecentMomentsGrid';
import CameraView from '../components/CameraViewWithTemplate';
import Toast from '../components/Toast';

type View = 'main' | 'camera' | 'story';

export default function EventPageStoryFirst() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [storyMedia, setStoryMedia] = useState<Photo[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('main');
  const [storyNextCursor, setStoryNextCursor] = useState<string | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [highlightCamera, setHighlightCamera] = useState(false);
  const [guestId, setGuestId] = useState('');

  useEffect(() => {
    if (!code) return;
    
    // Initialize guest ID for this event
    const id = getGuestId(code);
    setGuestId(id);
    api.setCurrentEvent(code);
    
    loadEvent();
    loadStory();
    loadRecentPhotos();
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

  async function loadRecentPhotos() {
    try {
      const data = await api.getEventPhotos(code!, {
        limit: 12,
        status: 'PROCESSED',
      });
      setRecentPhotos(data.data);
    } catch (err) {
      console.error('Failed to load recent photos:', err);
    }
  }

  async function handleUploadComplete() {
    await Promise.all([loadStory(), loadRecentPhotos()]);
    
    // Show success toast
    setToastMessage('Posted to story ✅');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    // Briefly highlight camera button
    setHighlightCamera(true);
    setTimeout(() => setHighlightCamera(false), 2000);
    
    // Return to main view
    setCurrentView('main');
  }

  function handleLoadMoreStory() {
    if (storyNextCursor) {
      loadStory(storyNextCursor);
    }
  }

  function handleStoryClick(_storyId: string) {
    // For now, show all stories starting from beginning
    // In production, filter by storyId
    setSelectedStoryIndex(0);
    setCurrentView('story');
  }

  function handleRecentPhotoClick(index: number) {
    setSelectedStoryIndex(index);
    setCurrentView('story');
  }

  // Derive theme from event template
  const theme = event?.template 
    ? deriveThemeFromTemplate(event.template.config)
    : deriveThemeFromTemplate();

  // Create story heads (simplified - in production, backend should provide this)
  const storyHeads: StoryHead[] = storyMedia.length > 0 ? [
    {
      storyId: guestId,
      displayName: 'My Story',
      coverUrl: storyMedia.find(m => (m as any).guestId === guestId)?.mediaType === 'VIDEO' 
        ? (storyMedia.find(m => (m as any).guestId === guestId) as any)?.posterUrl
        : (storyMedia.find(m => (m as any).guestId === guestId) as any)?.thumbUrl,
      hasNew: true,
      lastPostedAt: new Date().toISOString(),
    },
  ] : [];

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
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-[var(--fete-bg)] text-[var(--fete-text)]">
        {/* Toast */}
        <Toast message={toastMessage} visible={showToast} />

        {/* Main View */}
        <AnimatePresence mode="wait">
          {currentView === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="min-h-screen pb-32"
            >
              {/* Header */}
              <div className="sticky top-0 z-20 bg-gradient-to-b from-[var(--fete-bg)] to-transparent backdrop-blur-sm">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => navigate('/')}
                    className="p-2 text-[var(--fete-text)] hover:bg-white/10 rounded-full transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold">{event.name}</h1>
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--fete-accent)' }}
                      animate={{
                        opacity: [1, 0.5, 1],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </div>
                  <div className="w-10" />
                </div>
              </div>

              {/* Story Row Hero */}
              <div className="mt-8 mb-12">
                <div className="px-4 mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Live Story
                  </h2>
                </div>
                {storyHeads.length > 0 ? (
                  <StoryRow
                    stories={storyHeads}
                    myStoryId={guestId}
                    onStoryClick={handleStoryClick}
                  />
                ) : (
                  <div className="px-4">
                    <StoryRow
                      stories={[{
                        storyId: guestId,
                        displayName: 'My Story',
                        hasNew: false,
                        lastPostedAt: new Date().toISOString(),
                      }]}
                      myStoryId={guestId}
                      onStoryClick={handleStoryClick}
                    />
                  </div>
                )}
              </div>

              {/* Recent Moments Grid */}
              <div className="mt-12">
                <RecentMomentsGrid
                  photos={recentPhotos}
                  onPhotoClick={handleRecentPhotoClick}
                />
              </div>
            </motion.div>
          )}

          {/* Camera View */}
          {currentView === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
            >
              <CameraView
                event={event}
                uploaderHash={getUploaderHash()}
                onUploadComplete={handleUploadComplete}
              />
              <button
                onClick={() => setCurrentView('main')}
                className="absolute top-4 left-4 z-50 p-2 text-white hover:bg-white/20 rounded-full transition backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}

          {/* Story Viewer */}
          {currentView === 'story' && storyMedia.length > 0 && (
            <motion.div
              key="story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StoryViewer
                media={storyMedia}
                initialIndex={selectedStoryIndex}
                onClose={() => setCurrentView('main')}
                onLoadMore={storyNextCursor ? handleLoadMoreStory : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Camera Button (only on main view) */}
        {currentView === 'main' && (
          <FloatingCameraButton
            onClick={() => setCurrentView('camera')}
            highlight={highlightCamera}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
