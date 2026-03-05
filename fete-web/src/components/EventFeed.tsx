import { useState, useEffect, useRef } from 'react';
import type { FeedItem } from '../types';
import { api } from '../lib/api';
import FeedItemCard from './FeedItemCard';

interface Props {
  eventCode: string;
}

type SortOption = 'latest' | 'trending';

export default function EventFeed({ eventCode }: Props) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('latest');
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeed();
  }, [eventCode, sort]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, loadingMore]);

  async function loadFeed() {
    try {
      setLoading(true);
      const data = await api.getEventFeed(eventCode, {
        sort,
        limit: 30,
      });
      setItems(data.items);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return;

    try {
      setLoadingMore(true);
      const data = await api.getEventFeed(eventCode, {
        sort,
        cursor: nextCursor,
        limit: 30,
      });
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  }

  function handleSortChange(newSort: SortOption) {
    if (newSort !== sort) {
      setSort(newSort);
    }
  }

  function handleLikeUpdate(itemId: string, likeCount: number, likedByMe: boolean) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, likeCount, likedByMe } : item
      )
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Sort toggle */}
      <div className="flex items-center gap-2 mb-6 px-4">
        <button
          onClick={() => handleSortChange('latest')}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            sort === 'latest'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Latest
        </button>
        <button
          onClick={() => handleSortChange('trending')}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            sort === 'trending'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Trending
        </button>
      </div>

      {/* Feed items */}
      {items.length === 0 ? (
        <div className="text-center py-12 px-4">
          <svg className="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400 text-lg">No posts yet</p>
          <p className="text-gray-500 text-sm mt-2">Be the first to share a moment!</p>
        </div>
      ) : (
        <div className="space-y-6 px-4 pb-24">
          {items.map((item) => (
            <FeedItemCard
              key={item.id}
              item={item}
              onLikeUpdate={handleLikeUpdate}
            />
          ))}

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="h-4" />

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* End of feed */}
          {!nextCursor && items.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">You've reached the end</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
