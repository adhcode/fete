import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

interface Props {
  coverUrl?: string;
  displayName: string;
  hasNew: boolean;
  isMyStory?: boolean;
  onClick: () => void;
}

export default function StoryCircle({ coverUrl, displayName, hasNew, isMyStory, onClick }: Props) {
  const { theme } = useTheme();
  
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[80px]"
    >
      {/* Circle with gradient ring */}
      <div className="relative">
        {/* Gradient ring for new stories */}
        {hasNew && (
          <motion.div
            className="absolute inset-0 rounded-full p-[3px]"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            }}
            animate={{
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="w-full h-full rounded-full bg-[var(--fete-bg)]" />
          </motion.div>
        )}
        
        {/* Muted ring for viewed stories */}
        {!hasNew && (
          <div className="absolute inset-0 rounded-full p-[2px] bg-gray-700">
            <div className="w-full h-full rounded-full bg-[var(--fete-bg)]" />
          </div>
        )}
        
        {/* Story image */}
        <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-gray-800">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isMyStory ? (
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Display name */}
      <span className="text-xs text-[var(--fete-text)] font-medium truncate max-w-[80px]">
        {displayName}
      </span>
    </motion.button>
  );
}
