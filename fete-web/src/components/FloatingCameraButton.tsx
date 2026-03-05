import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

interface Props {
  onClick: () => void;
  highlight?: boolean;
}

export default function FloatingCameraButton({ onClick, highlight }: Props) {
  const { theme } = useTheme();
  
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
        boxShadow: highlight 
          ? `0 0 0 0 ${theme.accent}40, 0 8px 32px ${theme.accent}60`
          : `0 8px 32px ${theme.accent}40`,
      }}
      animate={highlight ? {
        boxShadow: [
          `0 0 0 0 ${theme.accent}40, 0 8px 32px ${theme.accent}60`,
          `0 0 0 20px ${theme.accent}00, 0 8px 32px ${theme.accent}60`,
          `0 0 0 0 ${theme.accent}40, 0 8px 32px ${theme.accent}60`,
        ],
      } : {
        boxShadow: `0 8px 32px ${theme.accent}40`,
      }}
      transition={{
        duration: 1.5,
        repeat: highlight ? Infinity : 0,
        ease: 'easeOut',
      }}
    >
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </motion.button>
  );
}
