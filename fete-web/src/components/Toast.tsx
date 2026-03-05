import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  message: string;
  visible: boolean;
  icon?: 'success' | 'error' | 'info';
}

export default function Toast({ message, visible, icon = 'success' }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-white/95 backdrop-blur-lg shadow-2xl flex items-center gap-3"
        >
          {icon === 'success' && (
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <span className="text-gray-900 font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
