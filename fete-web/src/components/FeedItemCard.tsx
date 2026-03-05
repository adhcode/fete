import { useState } from 'react';
import type { FeedItem } from '../types';
import { api } from '../lib/api';

interface Props {
  item: FeedItem;
  onLikeUpdate?: (itemId: string, likeCount: number, likedByMe: boolean) => void;
}

export default function FeedItemCard({ item, onLikeUpdate }: Props) {
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [likedByMe, setLikedByMe] = useState(item.likedByMe);
  const [isLiking, setIsLiking] = useState(false);

  const isVideo = item.mediaType === 'VIDEO';
  const displayUrl = isVideo ? item.posterUrl : item.thumbUrl;

  async function handleLikeToggle() {
    if (isLiking) return;

    // Optimistic update
    const newLikedByMe = !likedByMe;
    const newLikeCount = newLikedByMe ? likeCount + 1 : likeCount - 1;
    
    setLikedByMe(newLikedByMe);
    setLikeCount(newLikeCount);
    setIsLiking(true);

    try {
      const result = newLikedByMe
        ? await api.likePhoto(item.id)
        : await api.unlikePhoto(item.id);

      // Update with server response
      setLikeCount(result.likeCount);
      setLikedByMe(result.likedByMe);
      
      if (onLikeUpdate) {
        onLikeUpdate(item.id, result.likeCount, result.likedByMe);
      }
    } catch (err) {
      // Rollback on error
      setLikedByMe(!newLikedByMe);
      setLikeCount(likeCount);
      console.error('Failed to toggle like:', err);
    } finally {
      setIsLiking(false);
    }
  }

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      {/* Media */}
      <div className="relative aspect-square bg-gray-800">
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt={item.caption || (isVideo ? 'Video' : 'Photo')}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-4">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Actions and caption */}
      <div className="p-4">
        {/* Like button */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handleLikeToggle}
            disabled={isLiking}
            className="flex items-center gap-2 group"
          >
            {likedByMe ? (
              <svg className="w-7 h-7 text-red-500 transition-transform group-active:scale-125" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-white transition-transform group-active:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
            <span className="text-white font-semibold">{likeCount}</span>
          </button>
        </div>

        {/* Caption */}
        {item.caption && (
          <p className="text-gray-300 text-sm">{item.caption}</p>
        )}
      </div>
    </div>
  );
}
