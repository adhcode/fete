import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { composeImageWithTemplate, loadImage } from '../lib/template';
import type { Event, TemplateConfig, Template } from '../types';

interface Props {
  event: Event;
  uploaderHash: string;
  onUploadComplete: () => void;
}

type CaptureMode = 'photo' | 'video';

export default function CameraView({ event, uploaderHash, onUploadComplete }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ file: File | Blob; url: string; type: 'image' | 'video' } | null>(null);
  const [originalImage, setOriginalImage] = useState<File | Blob | null>(null); // Store original for template switching
  const [caption, setCaption] = useState('');
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(event.template?.id || null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Get selected template
  const selectedTemplate = availableTemplates.find(t => t.id === selectedTemplateId) || event.template;
  const hasTemplate = selectedTemplate && selectedTemplate.config;
  const templateConfig = selectedTemplate?.config as TemplateConfig | undefined;
  const overlayUrl = selectedTemplate?.overlayUrl;

  // Load available templates
  useEffect(() => {
    api.getTemplates()
      .then(templates => {
        setAvailableTemplates(templates);
        console.log('Loaded templates:', templates.length);
        
        // If event has a template, fetch its full details
        if (event.template?.id && !event.template.config) {
          api.getTemplate(event.template.id)
            .then(fullTemplate => {
              // Update event template with full config
              event.template = fullTemplate;
              setSelectedTemplateId(fullTemplate.id);
            })
            .catch(err => console.error('Failed to load event template details:', err));
        }
      })
      .catch(err => console.error('Failed to load templates:', err));
  }, []);

  // Load full template details when selected
  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== event.template?.id) {
      api.getTemplate(selectedTemplateId)
        .then(fullTemplate => {
          // Update the template in availableTemplates
          setAvailableTemplates(prev => 
            prev.map(t => t.id === fullTemplate.id ? fullTemplate : t)
          );
        })
        .catch(err => console.error('Failed to load template details:', err));
    }
  }, [selectedTemplateId]);

  // Debug logging
  useEffect(() => {
    console.log('Template Debug:', {
      hasTemplate,
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name,
      hasConfig: !!templateConfig,
      hasOverlay: !!overlayUrl,
      textFieldCount: templateConfig?.textFields?.length || 0,
      eventName: event.name,
      eventDate: event.date,
      eventVenue: event.venue,
      eventHashtag: event.hashtag
    });
  }, [event, hasTemplate, templateConfig, overlayUrl, selectedTemplate]);

  // Load overlay image
  useEffect(() => {
    if (overlayUrl && hasTemplate) {
      loadImage(overlayUrl)
        .then(setOverlayImage)
        .catch((err) => console.warn('Failed to load overlay:', err));
    }
  }, [overlayUrl, hasTemplate]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [facingMode]);

  // Draw template preview on canvas
  useEffect(() => {
    if (!videoRef.current || !previewCanvasRef.current || !cameraReady || !hasTemplate || !templateConfig) {
      return;
    }

    const drawFrame = () => {
      const video = videoRef.current;
      const canvas = previewCanvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw template overlay
      if (overlayImage && templateConfig.overlay) {
        ctx.save();
        ctx.globalAlpha = templateConfig.overlay.opacity;
        ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Draw text fields
      const scaleX = canvas.width / 1080;
      const scaleY = canvas.height / 1920;

      for (const field of templateConfig.textFields) {
        const text = resolveText(field.defaultValue);
        if (!text) continue;

        const x = (field.x / 100) * canvas.width;
        const y = (field.y / 100) * canvas.height;
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

        ctx.fillText(text, x, y);
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animationFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraReady, hasTemplate, templateConfig, overlayImage, event]);

  function resolveText(template: string): string {
    return template
      .replace(/\{\{event\.name\}\}/g, event.name || '')
      .replace(/\{\{event\.date\}\}/g, event.date ? formatDate(event.date) : '')
      .replace(/\{\{event\.venue\}\}/g, event.venue || '')
      .replace(/\{\{event\.hashtag\}\}/g, event.hashtag || '');
  }

  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  }

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: captureMode === 'video',
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
      setError(null);
    } catch (err) {
      setError('Camera access denied');
      console.error('Camera error:', err);
      setCameraReady(false);
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  function flipCamera() {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }

  async function capturePhoto() {
    if (!videoRef.current || !stream) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      // Store original image for template switching
      setOriginalImage(blob);
      
      // Apply template if configured (works with or without overlay)
      let finalBlob = blob;
      if (hasTemplate && templateConfig) {
        try {
          console.log('Applying template to captured photo...', {
            hasOverlay: !!overlayUrl,
            textFields: templateConfig.textFields.length
          });
          
          finalBlob = await composeImageWithTemplate(
            blob,
            templateConfig,
            overlayUrl || null,
            event,
            { quality: 0.95 }
          );
          
          console.log('Template applied successfully');
        } catch (err) {
          console.error('Failed to apply template:', err);
          // Fall back to original if template fails
        }
      }

      const file = new File([finalBlob], 'capture.jpg', { type: 'image/jpeg' });
      const url = URL.createObjectURL(finalBlob);
      setPreviewMedia({ file, url, type: 'image' });
    }, 'image/jpeg', 0.95);
  }

  function startRecording() {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], 'capture.webm', { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setPreviewMedia({ file, url, type: 'video' });
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordingTime(0);

    recordingIntervalRef.current = window.setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 15) {
          stopRecording();
          return 15;
        }
        return prev + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }

  function handleCapture() {
    if (captureMode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError('Please select an image or video');
      return;
    }

    const maxSize = isVideo ? 40 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Max ${isVideo ? '40MB' : '10MB'}`);
      return;
    }

    // For images, store original and apply template if configured
    if (isImage) {
      // Store original image for template switching
      setOriginalImage(file);
      
      if (hasTemplate && templateConfig) {
        try {
          console.log('Applying template to uploaded image...', {
            hasOverlay: !!overlayUrl,
            textFields: templateConfig.textFields.length
          });
          
          const composedBlob = await composeImageWithTemplate(
            file,
            templateConfig,
            overlayUrl || null,
            event,
            { quality: 0.95 }
          );
          
          console.log('Template applied successfully');
          const url = URL.createObjectURL(composedBlob);
          setPreviewMedia({ file: composedBlob, url, type: 'image' });
        } catch (err) {
          console.error('Failed to apply template:', err);
          setError('Failed to apply template. Using original image.');
          // Fall back to original
          const url = URL.createObjectURL(file);
          setPreviewMedia({ file, url, type: 'image' });
        }
      } else {
        // No template
        const url = URL.createObjectURL(file);
        setPreviewMedia({ file, url, type: 'image' });
      }
    } else {
      // Video
      const url = URL.createObjectURL(file);
      setPreviewMedia({ file, url, type: 'video' });
    }
  }

  function handleDiscardPreview() {
    if (previewMedia) {
      URL.revokeObjectURL(previewMedia.url);
      setPreviewMedia(null);
      setOriginalImage(null);
      setCaption('');
      setShowCaptionInput(false);
    }
  }

  async function handleSendMedia() {
    if (!previewMedia) return;
    await uploadFile(previewMedia.file);
    handleDiscardPreview();
  }

  async function uploadFile(file: File | Blob) {
    setUploading(true);
    setError(null);

    try {
      const isVideo = file instanceof File && file.type.startsWith('video/');
      const mediaType = isVideo ? 'VIDEO' : 'IMAGE';
      const contentType = file instanceof File ? file.type : 'image/jpeg';
      const fileSize = file.size;

      const { photoId, uploadUrl } = await api.createUploadIntent({
        eventCode: event.code,
        mediaType,
        contentType,
        fileSizeBytes: fileSize,
        caption: caption.trim() || undefined,
        uploaderHash,
      });

      await api.uploadToR2(uploadUrl, file);
      await api.completeUpload(photoId);

      onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  // Preview screen
  if (previewMedia) {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden">
        <div className="absolute inset-0">
          {previewMedia.type === 'image' ? (
            <img
              src={previewMedia.url}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <video
              src={previewMedia.url}
              className="absolute inset-0 w-full h-full object-contain"
              controls
              autoPlay
              loop
            />
          )}
        </div>

        {/* Template Selector in Preview - Snapchat Style */}
        {previewMedia.type === 'image' && availableTemplates.length > 0 && originalImage && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
            <div className="flex flex-col gap-3">
              {availableTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={async () => {
                    setSelectedTemplateId(template.id);
                    // Re-apply template to ORIGINAL image
                    try {
                      const fullTemplate = await api.getTemplate(template.id);
                      const composedBlob = await composeImageWithTemplate(
                        originalImage,
                        fullTemplate.config as TemplateConfig,
                        fullTemplate.overlayUrl || null,
                        event,
                        { quality: 0.95 }
                      );
                      const url = URL.createObjectURL(composedBlob);
                      URL.revokeObjectURL(previewMedia.url);
                      setPreviewMedia({ file: composedBlob, url, type: 'image' });
                      console.log('Template applied:', template.name);
                    } catch (err) {
                      console.error('Failed to apply template:', err);
                    }
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    selectedTemplateId === template.id
                      ? 'bg-white text-black scale-110 shadow-lg'
                      : 'bg-black/60 backdrop-blur-md text-white hover:bg-black/80'
                  }`}
                  title={template.name}
                >
                  <span className="text-xs font-bold">{template.name.charAt(0)}</span>
                </button>
              ))}
              
              {/* No Template Option */}
              <button
                onClick={() => {
                  setSelectedTemplateId(null);
                  // Show original image without template
                  const url = URL.createObjectURL(originalImage);
                  URL.revokeObjectURL(previewMedia.url);
                  setPreviewMedia({ file: originalImage, url, type: 'image' });
                  console.log('Template removed - showing original');
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  selectedTemplateId === null
                    ? 'bg-white text-black scale-110 shadow-lg'
                    : 'bg-black/60 backdrop-blur-md text-white hover:bg-black/80'
                }`}
                title="No Template"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent">
          <button
            onClick={handleDiscardPreview}
            disabled={uploading}
            className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Text/Caption Icon Button */}
          <button
            onClick={() => setShowCaptionInput(!showCaptionInput)}
            disabled={uploading}
            className={`p-3 backdrop-blur-md rounded-full transition disabled:opacity-50 ${
              showCaptionInput || caption
                ? 'bg-white text-black'
                : 'bg-black/40 text-white hover:bg-black/60'
            }`}
            title="Add caption"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
        </div>

        {/* Caption Input - Only show when text icon is clicked */}
        {showCaptionInput && (
          <div className="absolute bottom-24 left-0 right-0 px-6 z-40">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              maxLength={140}
              autoFocus
              className="w-full px-6 py-4 bg-black/40 backdrop-blur-md text-white placeholder-white/60 rounded-full border-2 border-white/20 focus:border-white/40 outline-none text-center font-medium"
            />
          </div>
        )}

        <div className="absolute bottom-8 right-6 z-50">
          <button
            onClick={handleSendMedia}
            disabled={uploading}
            className="p-5 bg-white rounded-full shadow-2xl hover:bg-gray-100 active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="w-7 h-7 border-3 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Camera view
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Camera feed with template overlay */}
      {hasTemplate ? (
        <canvas
          ref={previewCanvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Hidden video element for template mode */}
      {hasTemplate && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="hidden"
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 backdrop-blur-sm">
          <div className="text-center px-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-white text-base mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                startCamera();
              }}
              className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white text-lg font-medium">Uploading...</p>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 bg-red-500 px-5 py-2.5 rounded-full shadow-lg">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">{recordingTime}s</span>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 p-5 flex justify-end items-center z-20">
        <button
          onClick={flipCamera}
          disabled={!cameraReady || uploading}
          className="p-3.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pb-32 pt-6 px-6 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex justify-center gap-2 mb-10">
          <button
            onClick={() => {
              setCaptureMode('photo');
              if (isRecording) stopRecording();
            }}
            disabled={uploading}
            className={`px-10 py-3 rounded-full font-bold text-xs tracking-wider transition-all ${captureMode === 'photo'
              ? 'bg-white text-black shadow-2xl'
              : 'bg-transparent text-white/60 hover:text-white'
              }`}
          >
            PHOTO
          </button>
          <button
            onClick={() => setCaptureMode('video')}
            disabled={uploading}
            className={`px-10 py-3 rounded-full font-bold text-xs tracking-wider transition-all ${captureMode === 'video'
              ? 'bg-white text-black shadow-2xl'
              : 'bg-transparent text-white/60 hover:text-white'
              }`}
          >
            VIDEO
          </button>
        </div>

        <div className="flex items-center justify-center gap-12">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isRecording}
            className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 active:scale-90 transition-all disabled:opacity-30"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={handleCapture}
            disabled={uploading || !cameraReady}
            className={`relative transition-all ${uploading ? 'opacity-50' : 'active:scale-90'}`}
          >
            {isRecording ? (
              <div className="w-24 h-24 rounded-full border-[6px] border-red-500 flex items-center justify-center">
                <div className="w-8 h-8 bg-red-500 rounded-sm" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full border-[6px] border-white flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full" />
              </div>
            )}
          </button>

          <div className="w-[60px]" />
        </div>
      </div>

      {/* Template Selector - Snapchat Style */}
      {availableTemplates.length > 0 && !previewMedia && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <div className="flex flex-col gap-3">
            {availableTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  selectedTemplateId === template.id
                    ? 'bg-white text-black scale-110 shadow-lg'
                    : 'bg-black/40 backdrop-blur-md text-white hover:bg-black/60'
                }`}
                title={template.name}
              >
                <span className="text-xs font-bold">{template.name.charAt(0)}</span>
              </button>
            ))}
            
            {/* No Template Option */}
            <button
              onClick={() => setSelectedTemplateId(null)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                selectedTemplateId === null
                  ? 'bg-white text-black scale-110 shadow-lg'
                  : 'bg-black/40 backdrop-blur-md text-white hover:bg-black/60'
              }`}
              title="No Template"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
