import { useRef } from 'react';
import StoryCircle from './StoryCircle';

export interface StoryHead {
  storyId: string;
  displayName: string;
  coverUrl?: string;
  hasNew: boolean;
  lastPostedAt: string;
}

interface Props {
  stories: StoryHead[];
  myStoryId: string;
  onStoryClick: (storyId: string) => void;
}

export default function StoryRow({ stories, myStoryId, onStoryClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Put "My Story" first
  const myStory = stories.find(s => s.storyId === myStoryId);
  const otherStories = stories.filter(s => s.storyId !== myStoryId);
  
  const sortedStories = [
    myStory || { storyId: myStoryId, displayName: 'My Story', hasNew: false, lastPostedAt: new Date().toISOString() },
    ...otherStories.sort((a, b) => new Date(b.lastPostedAt).getTime() - new Date(a.lastPostedAt).getTime()),
  ];
  
  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {sortedStories.map((story) => (
          <StoryCircle
            key={story.storyId}
            coverUrl={story.coverUrl}
            displayName={story.displayName}
            hasNew={story.hasNew}
            isMyStory={story.storyId === myStoryId}
            onClick={() => onStoryClick(story.storyId)}
          />
        ))}
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
