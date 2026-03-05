import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Photo, ImageMedia, VideoMedia } from '../types';

interface Props {
  media: Photo[];
  initialIndex?: number;
  onClose: () => void;
  onLoadMore?: () => void;
}

export default function StoryViewer({ media, initialIndex = 0, onClose, onLoadMore }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<number | null>(null);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.mediaType === 'VIDEO';
  const duration = isVideo ? (currentMedia as VideoMedia).durationSec || 5 : 5;

  useEffect(() => {
    if (isPaused) return;
    
    setProgress(0);
    
    if (isVideo && videoRef.current) {
      // For videos, track actual playback progress
      const video = videoRef.current;
      
      const updateProgress = () => {
        if (video.duration) {
          setProgress((video.currentTime / video.duration) * 100);
        }
      };

      const handleEnded = () => {
        handleNext();
      };

      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('timeupdate', updateProgress);
        video.removeEventListener('ended', handleEnded);
      };
    } else {
      // For images, use timer
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / (duration * 1000)) * 100;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          handleNext();
        } else {
          setProgress(newProgress);
        }
      }, 50);

      progressInterval.current = interval;

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [currentIndex, isVideo, duration, isPaused]);

  function handleNext() {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (onLoadMore) {
      onLoadMore();
    } else {
      onClose();
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;

    if (x < third) {
      handlePrev();
    } else if (x > third * 2) {
      handleNext();
    }
  }

  function handleHold() {
    setIsPaused(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }

  function handleRelease() {
    setIsPaused(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  }

  function toggleMute() {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }

  if (!currentMedia) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3">
        {media.map((_, idx) => (
          <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: '0%' }}
              animate={{
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-12 right-4 z-10 text-white p-2 hover:bg-white/20 rounded-full transition backdrop-blur-sm"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      {/* Mute/Unmute button for videos */}
      {isVideo && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="absolute top-12 left-4 z-10 text-white p-2 hover:bg-white/20 rounded-full transition backdrop-blur-sm"
        >
          {isMuted ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </motion.button>
      )}

      {/* Media content */}
      <div
        className="flex-1 flex items-center justify-center relative select-none"
        onClick={handleTap}
        onMouseDown={handleHold}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={handleHold}
        onTouchEnd={handleRelease}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="max-w-full max-h-full"
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={(currentMedia as VideoMedia).playbackUrl}
                poster={(currentMedia as VideoMedia).posterUrl}
                className="max-w-full max-h-full object-contain"
                autoPlay
                muted={isMuted}
                playsInline
              />
            ) : (
              <img
                src={(currentMedia as ImageMedia).largeUrl}
                alt={currentMedia.caption || 'Story'}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pause indicator */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/50 rounded-full p-6 backdrop-blur-sm">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Caption */}
      {currentMedia.caption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
        >
          <p className="text-white text-base text-center">{currentMedia.caption}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
