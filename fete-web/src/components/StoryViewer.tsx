import { useState, useEffect, useRef } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.mediaType === 'VIDEO';
  const duration = isVideo ? (currentMedia as VideoMedia).durationSec || 5 : 5;

  useEffect(() => {
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
  }, [currentIndex, isVideo, duration]);

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
    // Middle third - no action (let other controls handle it)
  }

  function toggleMute() {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }

  if (!currentMedia) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {media.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white p-2 hover:bg-white/20 rounded-full transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Mute/Unmute button for videos */}
      {isVideo && (
        <button
          onClick={toggleMute}
          className="absolute top-4 left-4 z-10 text-white p-2 hover:bg-white/20 rounded-full transition"
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
        </button>
      )}

      {/* Media content */}
      <div
        className="flex-1 flex items-center justify-center relative"
        onClick={handleTap}
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

        {/* Navigation hints */}
        <div className="absolute inset-0 flex">
          <div className="flex-1" />
          <div className="flex-1" />
          <div className="flex-1" />
        </div>
      </div>

      {/* Caption */}
      {currentMedia.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-lg text-center">{currentMedia.caption}</p>
        </div>
      )}

      {/* Media type indicator */}
      <div className="absolute bottom-4 left-4 text-white/70 text-sm">
        {currentIndex + 1} / {media.length}
      </div>
    </div>
  );
}
