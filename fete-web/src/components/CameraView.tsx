import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';

interface Props {
  eventCode: string;
  uploaderHash: string;
  onUploadComplete: () => void;
}

type CaptureMode = 'photo' | 'video';

export default function CameraView({ eventCode, uploaderHash, onUploadComplete }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ file: File; url: string; type: 'image' | 'video' } | null>(null);
  const [caption, setCaption] = useState('');
  const [textOverlays, setTextOverlays] = useState<Array<{ id: string; text: string; x: number; y: number; color: string }>>([]);
  const [isAddingText, setIsAddingText] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

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
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
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

    recordingIntervalRef.current = setInterval(() => {
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
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

    // Show preview
    const url = URL.createObjectURL(file);
    setPreviewMedia({ file, url, type: isVideo ? 'video' : 'image' });
  }

  function handleDiscardPreview() {
    if (previewMedia) {
      URL.revokeObjectURL(previewMedia.url);
      setPreviewMedia(null);
      setCaption('');
      setTextOverlays([]);
      setIsAddingText(false);
      setEditingTextId(null);
      setNewText('');
    }
  }

  async function handleDownloadMedia() {
    if (!previewMedia) return;

    try {
      // Fetch the blob from the URL
      const response = await fetch(previewMedia.url);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fete-${Date.now()}.${previewMedia.type === 'video' ? 'webm' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Download failed');
    }
  }

  function handleAddText() {
    setIsAddingText(true);
    setNewText('');
    setTimeout(() => textInputRef.current?.focus(), 100);
  }

  function handleSaveText() {
    if (!newText.trim()) {
      setIsAddingText(false);
      return;
    }

    const colors = ['#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    if (editingTextId) {
      setTextOverlays(prev => prev.map(t =>
        t.id === editingTextId ? { ...t, text: newText } : t
      ));
      setEditingTextId(null);
    } else {
      const newOverlay = {
        id: Date.now().toString(),
        text: newText,
        x: 50, // Center
        y: 50, // Center
        color: randomColor,
      };
      setTextOverlays(prev => [...prev, newOverlay]);
    }

    setNewText('');
    setIsAddingText(false);
  }

  function handleMoveText(id: string, e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const rect = target.parentElement!.getBoundingClientRect();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setTextOverlays(prev => prev.map(t =>
      t.id === id ? { ...t, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : t
    ));
  }

  function handleDeleteText(id: string) {
    setTextOverlays(prev => prev.filter(t => t.id !== id));
  }

  async function handleSendMedia() {
    if (!previewMedia) return;
    await uploadFile(previewMedia.file);
    handleDiscardPreview();
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);

    try {
      const isVideo = file.type.startsWith('video/');
      const mediaType = isVideo ? 'VIDEO' : 'IMAGE';

      const { photoId, uploadUrl } = await api.createUploadIntent({
        eventCode,
        mediaType,
        contentType: file.type,
        fileSizeBytes: file.size,
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
        {/* Preview media */}
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

          {/* Text overlays */}
          {textOverlays.map((overlay) => (
            <div
              key={overlay.id}
              style={{
                position: 'absolute',
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                transform: 'translate(-50%, -50%)',
                color: overlay.color,
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                zIndex: 30,
              }}
              className="text-2xl font-bold cursor-move select-none"
              onTouchMove={(e) => handleMoveText(overlay.id, e)}
              onMouseMove={(e) => e.buttons === 1 && handleMoveText(overlay.id, e)}
              onDoubleClick={() => handleDeleteText(overlay.id)}
            >
              {overlay.text}
            </div>
          ))}
        </div>

        {/* Top controls */}
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

          <div className="flex gap-3">
            <button
              onClick={handleDownloadMedia}
              disabled={uploading}
              className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            <button
              onClick={handleAddText}
              disabled={uploading}
              className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Text input modal */}
        {isAddingText && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-6 w-80 mx-4">
              <input
                ref={textInputRef}
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveText()}
                placeholder="Type something..."
                maxLength={50}
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-white/50 rounded-lg border-2 border-white/20 focus:border-white/40 outline-none text-lg font-medium"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setIsAddingText(false);
                    setNewText('');
                  }}
                  className="flex-1 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveText}
                  className="flex-1 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-100 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Caption input */}
        <div className="absolute bottom-24 left-0 right-0 px-6 z-40">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            maxLength={140}
            className="w-full px-6 py-4 bg-black/40 backdrop-blur-md text-white placeholder-white/60 rounded-full border-2 border-white/20 focus:border-white/40 outline-none text-center font-medium"
          />
        </div>

        {/* Send button - bottom right corner */}
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
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error overlay */}
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

      {/* Uploading overlay */}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white text-lg font-medium">Uploading...</p>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 bg-red-500 px-5 py-2.5 rounded-full shadow-lg">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            <span className="text-white font-semibold text-sm">{recordingTime}s</span>
          </div>
        </div>
      )}

      {/* Top controls */}
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

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-32 pt-6 px-6 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        {/* Mode toggle */}
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
            onClick={() => {
              setCaptureMode('video');
            }}
            disabled={uploading}
            className={`px-10 py-3 rounded-full font-bold text-xs tracking-wider transition-all ${captureMode === 'video'
              ? 'bg-white text-black shadow-2xl'
              : 'bg-transparent text-white/60 hover:text-white'
              }`}
          >
            VIDEO
          </button>
        </div>

        {/* Capture button - centered and clean */}
        <div className="flex items-center justify-center gap-12">
          {/* Upload from gallery */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isRecording}
            className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 active:scale-90 transition-all disabled:opacity-30"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={uploading || !cameraReady}
            className={`relative transition-all ${uploading ? 'opacity-50' : 'active:scale-90'}`}
          >
            {isRecording ? (
              // Recording state - red square
              <div className="w-24 h-24 rounded-full border-[6px] border-red-500 flex items-center justify-center">
                <div className="w-8 h-8 bg-red-500 rounded-sm" />
              </div>
            ) : (
              // Ready to capture - white circle
              <div className="w-24 h-24 rounded-full border-[6px] border-white flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full" />
              </div>
            )}
          </button>

          {/* Spacer for symmetry */}
          <div className="w-[60px]" />
        </div>
      </div>
    </div>
  );
}
