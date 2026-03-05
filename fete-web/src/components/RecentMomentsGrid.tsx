import { motion } from 'framer-motion';
import type { Photo } from '../types';

interface Props {
  photos: Photo[];
  onPhotoClick: (index: number) => void;
}

export default function RecentMomentsGrid({ photos, onPhotoClick }: Props) {
  if (photos.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-sm">Be the first to post</p>
        <p className="text-gray-600 text-xs mt-1">Snap a moment — it shows up instantly</p>
      </div>
    );
  }
  
  return (
    <div className="px-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
        Recent Moments
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 12).map((photo, index) => {
          const isVideo = photo.mediaType === 'VIDEO';
          const thumbUrl = isVideo ? (photo as any).posterUrl : (photo as any).thumbUrl;
          
          return (
            <motion.button
              key={photo.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPhotoClick(index)}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-900"
            >
              {thumbUrl ? (
                <>
                  <img
                    src={thumbUrl}
                    alt={photo.caption || ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
