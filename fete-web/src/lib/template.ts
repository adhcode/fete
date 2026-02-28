import type { TemplateConfig, Event } from '../types';

const TEMPLATE_BASE_WIDTH = 1080;
const TEMPLATE_BASE_HEIGHT = 1920;
const MAX_OUTPUT_WIDTH = 2160; // Max output resolution

interface ComposeOptions {
  quality?: number; // JPEG quality 0-1
  maxWidth?: number;
}

/**
 * Load an image from URL or File and return HTMLImageElement
 */
export async function loadImage(source: string | File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    if (typeof source === 'string') {
      img.src = source;
    } else {
      img.src = URL.createObjectURL(source);
    }
  });
}

/**
 * Resolve template placeholders with event data
 */
function resolvePlaceholder(text: string, event: Event): string {
  return text
    .replace(/\{\{event\.name\}\}/g, event.name || '')
    .replace(/\{\{event\.date\}\}/g, event.date ? formatDate(event.date) : '')
    .replace(/\{\{event\.venue\}\}/g, event.venue || '')
    .replace(/\{\{event\.hashtag\}\}/g, event.hashtag || '');
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

/**
 * Apply EXIF orientation to canvas
 */
function applyOrientation(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number
) {
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
  }
}

/**
 * Get EXIF orientation from image file
 */
async function getOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer);
      if (view.getUint16(0, false) !== 0xffd8) {
        resolve(1);
        return;
      }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) {
          resolve(1);
          return;
        }
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xffe1) {
          offset += 2;
          if (view.getUint32(offset, false) !== 0x45786966) {
            resolve(1);
            return;
          }
          const little = view.getUint16((offset += 6), false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) === 0x0112) {
              resolve(view.getUint16(offset + i * 12 + 8, little));
              return;
            }
          }
        } else if ((marker & 0xff00) !== 0xff00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      resolve(1);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

/**
 * Compose image with template overlay and text
 */
export async function composeImageWithTemplate(
  imageSource: File | Blob,
  templateConfig: TemplateConfig,
  overlayUrl: string | null,
  event: Event,
  options: ComposeOptions = {}
): Promise<Blob> {
  const { quality = 0.95, maxWidth = MAX_OUTPUT_WIDTH } = options;

  // Load base image
  const baseImage = await loadImage(imageSource);
  
  // Get orientation if it's a File
  let orientation = 1;
  if (imageSource instanceof File) {
    orientation = await getOrientation(imageSource);
  }

  // Calculate output dimensions
  let outputWidth = baseImage.width;
  let outputHeight = baseImage.height;

  // Handle orientation swap for rotated images
  if (orientation >= 5 && orientation <= 8) {
    [outputWidth, outputHeight] = [outputHeight, outputWidth];
  }

  // Scale down if needed
  if (outputWidth > maxWidth) {
    const scale = maxWidth / outputWidth;
    outputWidth = maxWidth;
    outputHeight = Math.round(outputHeight * scale);
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d', { alpha: false });
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Apply orientation transformation
  ctx.save();
  applyOrientation(ctx, orientation, outputWidth, outputHeight);

  // Draw base image
  if (orientation >= 5 && orientation <= 8) {
    ctx.drawImage(baseImage, 0, 0, outputHeight, outputWidth);
  } else {
    ctx.drawImage(baseImage, 0, 0, outputWidth, outputHeight);
  }
  
  ctx.restore();

  // Calculate scale factor from template coordinate space to actual pixels
  const scaleX = outputWidth / TEMPLATE_BASE_WIDTH;
  const scaleY = outputHeight / TEMPLATE_BASE_HEIGHT;

  // Draw overlay if provided
  if (overlayUrl && templateConfig.overlay) {
    try {
      const overlayImage = await loadImage(overlayUrl);
      
      ctx.save();
      ctx.globalAlpha = templateConfig.overlay.opacity;
      
      // Apply blend mode
      switch (templateConfig.overlay.blendMode) {
        case 'multiply':
          ctx.globalCompositeOperation = 'multiply';
          break;
        case 'screen':
          ctx.globalCompositeOperation = 'screen';
          break;
        case 'overlay':
          ctx.globalCompositeOperation = 'overlay';
          break;
        default:
          ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.drawImage(overlayImage, 0, 0, outputWidth, outputHeight);
      ctx.restore();
    } catch (err) {
      console.warn('Failed to load overlay image:', err);
    }
  }

  // Draw text fields
  for (const field of templateConfig.textFields) {
    const text = resolvePlaceholder(field.defaultValue, event);
    if (!text) continue;

    // Calculate position in pixels
    const x = (field.x / 100) * outputWidth;
    const y = (field.y / 100) * outputHeight;
    const fontSize = field.fontSize * Math.min(scaleX, scaleY);

    ctx.save();
    
    // Set font
    ctx.font = `${field.fontWeight} ${fontSize}px ${field.fontFamily}`;
    ctx.fillStyle = field.color;
    ctx.textAlign = field.align;
    ctx.textBaseline = 'top';

    // Apply shadow if configured
    if (field.shadow) {
      ctx.shadowOffsetX = field.shadow.offsetX * scaleX;
      ctx.shadowOffsetY = field.shadow.offsetY * scaleY;
      ctx.shadowBlur = field.shadow.blur * Math.min(scaleX, scaleY);
      ctx.shadowColor = field.shadow.color;
    }

    // Draw text
    if (field.maxWidth) {
      const maxWidth = field.maxWidth * scaleX;
      ctx.fillText(text, x, y, maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }

    ctx.restore();
  }

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Preview template overlay on canvas (for live camera preview)
 */
export function drawTemplatePreview(
  canvas: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
  templateConfig: TemplateConfig,
  overlayImage: HTMLImageElement | null,
  event: Event
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Draw video frame
  ctx.drawImage(videoElement, 0, 0, width, height);

  // Calculate scale
  const scaleX = width / TEMPLATE_BASE_WIDTH;
  const scaleY = height / TEMPLATE_BASE_HEIGHT;

  // Draw overlay
  if (overlayImage && templateConfig.overlay) {
    ctx.save();
    ctx.globalAlpha = templateConfig.overlay.opacity;
    
    switch (templateConfig.overlay.blendMode) {
      case 'multiply':
        ctx.globalCompositeOperation = 'multiply';
        break;
      case 'screen':
        ctx.globalCompositeOperation = 'screen';
        break;
      case 'overlay':
        ctx.globalCompositeOperation = 'overlay';
        break;
      default:
        ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.drawImage(overlayImage, 0, 0, width, height);
    ctx.restore();
  }

  // Draw text fields
  for (const field of templateConfig.textFields) {
    const text = resolvePlaceholder(field.defaultValue, event);
    if (!text) continue;

    const x = (field.x / 100) * width;
    const y = (field.y / 100) * height;
    const fontSize = field.fontSize * Math.min(scaleX, scaleY);

    ctx.save();
    ctx.font = `${field.fontWeight} ${fontSize}px ${field.fontFamily}`;
    ctx.fillStyle = field.color;
    ctx.textAlign = field.align;
    ctx.textBaseline = 'top';

    if (field.shadow) {
      ctx.shadowOffsetX = field.shadow.offsetX * scaleX;
      ctx.shadowOffsetY = field.shadow.offsetY * scaleY;
      ctx.shadowBlur = field.shadow.blur * Math.min(scaleX, scaleY);
      ctx.shadowColor = field.shadow.color;
    }

    if (field.maxWidth) {
      const maxWidth = field.maxWidth * scaleX;
      ctx.fillText(text, x, y, maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }

    ctx.restore();
  }
}
