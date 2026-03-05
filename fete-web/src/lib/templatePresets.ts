import type { TemplateConfig } from '../types';

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  generate: (eventName: string) => TemplateConfig;
}

export const templatePresets: TemplatePreset[] = [
  {
    id: 'classic-top',
    name: 'Classic Top',
    description: 'Event name at the top with elegant styling',
    thumbnail: '🎯',
    generate: (eventName: string) => ({
      version: '1.0',
      overlay: {
        opacity: 1,
        blendMode: 'normal'
      },
      textFields: [
        {
          id: 'eventName',
          defaultValue: eventName,
          x: 50,
          y: 8,
          fontSize: 38,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#FFFFFF',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 3,
            blur: 8,
            color: 'rgba(0,0,0,0.8)'
          }
        }
      ]
    })
  },
  {
    id: 'classic-bottom',
    name: 'Classic Bottom',
    description: 'Event name at the bottom - Snapchat style',
    thumbnail: '📍',
    generate: (eventName: string) => ({
      version: '1.0',
      overlay: {
        opacity: 1,
        blendMode: 'normal'
      },
      textFields: [
        {
          id: 'eventName',
          defaultValue: eventName,
          x: 50,
          y: 92,
          fontSize: 42,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#FFFFFF',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 3,
            blur: 8,
            color: 'rgba(0,0,0,0.9)'
          }
        }
      ]
    })
  },
  {
    id: 'university-style',
    name: 'University',
    description: 'Academic institution style with location',
    thumbnail: '🎓',
    generate: (eventName: string) => ({
      version: '1.0',
      overlay: {
        opacity: 1,
        blendMode: 'normal'
      },
      textFields: [
        {
          id: 'eventName',
          defaultValue: eventName.toUpperCase(),
          x: 50,
          y: 50,
          fontSize: 44,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#FFFFFF',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 4,
            blur: 10,
            color: 'rgba(0,0,0,0.9)'
          }
        },
        {
          id: 'location',
          defaultValue: '{{event.venue}}',
          x: 50,
          y: 58,
          fontSize: 28,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          color: '#FFFFFF',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 2,
            blur: 6,
            color: 'rgba(0,0,0,0.8)'
          }
        }
      ]
    })
  },
  {
    id: 'party-vibes',
    name: 'Party Vibes',
    description: 'Fun party template with hashtag',
    thumbnail: '🎉',
    generate: (eventName: string) => ({
      version: '1.0',
      overlay: {
        opacity: 1,
        blendMode: 'normal'
      },
      textFields: [
        {
          id: 'eventName',
          defaultValue: eventName,
          x: 50,
          y: 10,
          fontSize: 48,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#FFD700',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 4,
            blur: 12,
            color: 'rgba(0,0,0,1)'
          }
        },
        {
          id: 'hashtag',
          defaultValue: '{{event.hashtag}}',
          x: 50,
          y: 90,
          fontSize: 32,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#FF6B6B',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 3,
            blur: 8,
            color: 'rgba(0,0,0,0.9)'
          }
        }
      ]
    })
  },
  {
    id: 'wedding-elegant',
    name: 'Wedding Elegant',
    description: 'Elegant wedding template with date',
    thumbnail: '💍',
    generate: (eventName: string) => ({
      version: '1.0',
      overlay: {
        opacity: 1,
        blendMode: 'normal'
      },
      textFields: [
        {
          id: 'eventName',
          defaultValue: eventName,
          x: 50,
          y: 88,
          fontSize: 40,
          fontFamily: 'Georgia',
          fontWeight: 'normal',
          color: '#FFFFFF',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 2,
            blur: 6,
            color: 'rgba(0,0,0,0.7)'
          }
        },
        {
          id: 'date',
          defaultValue: '{{event.date}}',
          x: 50,
          y: 94,
          fontSize: 24,
          fontFamily: 'Georgia',
          fontWeight: 'normal',
          color: '#FFFFFF',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 2,
            blur: 4,
            color: 'rgba(0,0,0,0.6)'
          }
        }
      ]
    })
  },
  {
    id: 'corporate-minimal',
    name: 'Corporate Minimal',
    description: 'Clean corporate event template',
    thumbnail: '💼',
    generate: (eventName: string) => ({
      version: '1.0',
      overlay: {
        opacity: 1,
        blendMode: 'normal'
      },
      textFields: [
        {
          id: 'eventName',
          defaultValue: eventName.toUpperCase(),
          x: 50,
          y: 8,
          fontSize: 36,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#FFFFFF',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 2,
            blur: 6,
            color: 'rgba(0,0,0,0.8)'
          }
        },
        {
          id: 'venue',
          defaultValue: '{{event.venue}}',
          x: 50,
          y: 14,
          fontSize: 20,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          color: '#FFFFFF',
          align: 'center',
          shadow: {
            offsetX: 0,
            offsetY: 1,
            blur: 4,
            color: 'rgba(0,0,0,0.7)'
          }
        }
      ]
    })
  },
  {
    id: 'festival-bold',
    name: 'Festival Bold',
    description: 'Bold festival style with multiple colors',
    thumbnail: '🎪',
    generate: (eventName: string) => ({
      version: '1.0',
      overlay: {
        opacity: 1,
        blendMode: 'normal'
      },
      textFields: [
        {
          id: 'eventName',
          defaultValue: eventName.toUpperCase(),
          x: 50,
          y: 50,
          fontSize: 52,
          fontFamily: 'Impact',
          fontWeight: 'bold',
          color: '#FFFFFF',
          align: 'center',
          shadow: {
            offsetX: 4,
            offsetY: 4,
            blur: 0,
            color: '#FF6B6B'
          }
        },
        {
          id: 'date',
          defaultValue: '{{event.date}}',
          x: 50,
          y: 60,
          fontSize: 28,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#FFD700',
          align: 'center',
          shadow: {
            offsetX: 2,
            offsetY: 2,
            blur: 4,
            color: 'rgba(0,0,0,0.9)'
          }
        }
      ]
    })
  },
  {
    id: 'birthday-fun',
    name: 'Birthday Fun',
    description: 'Playful birthday celebration template',
    thumbnail: '🎂',
    generate: (eventName: string) => ({
      version: '1.0',
      overlay: {
        opacity: 1,
        blendMode: 'normal'
      },
      textFields: [
        {
          id: 'eventName',
          defaultValue: eventName,
          x: 50,
          y: 15,
          fontSize: 46,
          fontFamily: 'Comic Sans MS',
          fontWeight: 'bold',
          color: '#FF6B6B',
          align: 'center',
          shadow: {
            offsetX: 3,
            offsetY: 3,
            blur: 0,
            color: '#FFD700'
          }
        },
        {
          id: 'hashtag',
          defaultValue: '{{event.hashtag}}',
          x: 50,
          y: 88,
          fontSize: 34,
          fontFamily: 'Comic Sans MS',
          fontWeight: 'bold',
          color: '#9B59B6',
          align: 'center',
          shadow: {
            offsetX: 2,
            offsetY: 2,
            blur: 6,
            color: 'rgba(0,0,0,0.8)'
          }
        }
      ]
    })
  }
];

export function getPresetById(id: string): TemplatePreset | undefined {
  return templatePresets.find(p => p.id === id);
}
