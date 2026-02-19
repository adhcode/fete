import { useState, useRef } from 'react';
import { api } from '../lib/api';

interface Props {
  eventCode: string;
  uploaderHash: string;
  onUploadComplete: () => void;
}

export default function UploadSection({ eventCode, uploaderHash, onUploadComplete }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine media type
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError('Please select an image or video file');
      return;
    }

    // Validate file size
    const maxSize = isVideo ? 40 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${isVideo ? '40MB' : '10MB'}`);
      return;
    }

    // Validate video type
    if (isVideo && file.type !== 'video/mp4') {
      setError('Only MP4 videos are supported');
      return;
    }

    setSelectedFile(file);
    setMediaType(isVideo ? 'VIDEO' : 'IMAGE');
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Get upload intent
      const { photoId, uploadUrl } = await api.createUploadIntent({
        eventCode,
        mediaType,
        contentType: selectedFile.type,
        fileSizeBytes: selectedFile.size,
        caption: caption.trim() || undefined,
        uploaderHash,
      });

      // 2. Upload to R2
      await api.uploadToR2(uploadUrl, selectedFile);

      // 3. Complete upload
      await api.completeUpload(photoId);

      // Reset form
      setSelectedFile(null);
      setCaption('');
      setPreview(null);
      setMediaType('IMAGE');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Notify parent
      onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleCameraCapture() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Photo</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {preview ? (
          <div className="relative">
            {mediaType === 'VIDEO' ? (
              <video
                src={preview}
                className="w-full h-64 object-cover rounded-lg"
                controls
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                setMediaType('IMAGE');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {mediaType === 'VIDEO' && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                Video (max 15s)
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={handleCameraCapture}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Take Photo or Video
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Images: JPEG/PNG, max 10MB<br />
              Videos: MP4 only, max 40MB, 15s
            </p>
          </div>
        )}

        {selectedFile && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption (optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={140}
                placeholder="Add a caption..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">{caption.length}/140</p>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Photo'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
