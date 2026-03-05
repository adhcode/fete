import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import type { Template } from '../types';

interface Props {
  templates: Template[];
  activeTemplateId: string | null;
  onChange: (template: Template | null) => void;
  disabled?: boolean;
}

export default function TemplateSwiper({ templates, activeTemplateId, onChange, disabled }: Props) {
  const [showNamePill, setShowNamePill] = useState(false);
  const [pillTimeout, setPillTimeout] = useState<number | null>(null);

  const activeIndex = templates.findIndex(t => t.id === activeTemplateId);
  const currentIndex = activeIndex === -1 ? -1 : activeIndex; // -1 means no template

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (disabled) return;
      // Swipe left = next template
      if (currentIndex === -1) {
        // No template selected, select first
        if (templates.length > 0) {
          handleTemplateChange(templates[0]);
        }
      } else if (currentIndex < templates.length - 1) {
        handleTemplateChange(templates[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (disabled) return;
      // Swipe right = previous template
      if (currentIndex > 0) {
        handleTemplateChange(templates[currentIndex - 1]);
      } else if (currentIndex === 0) {
        // At first template, go to no template
        handleTemplateChange(null);
      }
    },
    trackMouse: true,
    trackTouch: true,
    delta: 50, // Minimum swipe distance
    preventScrollOnSwipe: false,
    touchEventOptions: { passive: true },
  });

  function handleTemplateChange(template: Template | null) {
    onChange(template);
    showPillTemporarily();
  }

  function showPillTemporarily() {
    // Clear existing timeout
    if (pillTimeout) {
      clearTimeout(pillTimeout);
    }

    setShowNamePill(true);
    const timeout = window.setTimeout(() => {
      setShowNamePill(false);
    }, 600);
    setPillTimeout(timeout);
  }

  useEffect(() => {
    return () => {
      if (pillTimeout) {
        clearTimeout(pillTimeout);
      }
    };
  }, [pillTimeout]);

  // Keyboard support
  useEffect(() => {
    if (disabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        // Previous template
        if (currentIndex > 0) {
          handleTemplateChange(templates[currentIndex - 1]);
        } else if (currentIndex === 0) {
          handleTemplateChange(null);
        }
      } else if (e.key === 'ArrowRight') {
        // Next template
        if (currentIndex === -1) {
          if (templates.length > 0) {
            handleTemplateChange(templates[0]);
          }
        } else if (currentIndex < templates.length - 1) {
          handleTemplateChange(templates[currentIndex + 1]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, templates, disabled]);

  const activeTemplate = currentIndex >= 0 ? templates[currentIndex] : null;
  const templateName = activeTemplate?.name || 'No Template';

  // Only show if there are templates to swipe through
  if (templates.length === 0) {
    return null;
  }

  return (
    <div
      {...handlers}
      className="absolute inset-0 pointer-events-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Template Name Pill */}
      <AnimatePresence>
        {showNamePill && templates.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-6 py-3 bg-black/80 backdrop-blur-md rounded-full">
              <p className="text-white font-semibold text-sm whitespace-nowrap">
                {templateName}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dots Indicator (optional, only if multiple templates) */}
      {templates.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="flex items-center gap-2">
            {/* No template dot */}
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                currentIndex === -1 ? 'bg-white w-2 h-2' : 'bg-white/40'
              }`}
            />
            {templates.map((template, idx) => (
              <div
                key={template.id}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-2 h-2' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
