import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/auth';
import { templatePresets, getPresetById } from '../lib/templatePresets';
import type { TemplateConfig, TextField } from '../types';

export default function NewTemplatePage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState('');
  const [overlayUrl, setOverlayUrl] = useState('');
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('/api/placeholder/400/600');
  
  const [config, setConfig] = useState<TemplateConfig>({
    version: "1.0",
    overlay: {
      opacity: 1,
      blendMode: "normal"
    },
    textFields: [
      {
        id: "eventName",
        defaultValue: "{{event.name}}",
        x: 50,
        y: 88,
        fontSize: 42,
        fontFamily: "Arial",
        fontWeight: "bold",
        color: "#FFFFFF",
        align: "center",
        shadow: {
          offsetX: 2,
          offsetY: 2,
          blur: 6,
          color: "rgba(0,0,0,0.9)"
        }
      }
    ]
  });

  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/org/login');
    }
  }, []);

  // Load overlay image
  useEffect(() => {
    if (overlayUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setOverlayImage(img);
      img.onerror = () => setError('Failed to load overlay image');
      img.src = overlayUrl;
    } else {
      setOverlayImage(null);
    }
  }, [overlayUrl]);

  // Render preview
  useEffect(() => {
    renderPreview();
  }, [config, overlayImage, previewImage, name]);

  function renderPreview() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw preview image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw overlay if exists
      if (overlayImage) {
        ctx.globalAlpha = config.overlay.opacity;
        ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }

      // Draw text fields
      config.textFields.forEach((field, index) => {
        // Replace template variables with actual values or defaults
        let text = field.defaultValue;
        
        // If the field contains the event name variable, use the actual name if available
        if (text.includes('{{event.name}}')) {
          text = text.replace(/\{\{event\.name\}\}/g, name || 'Your Event Name');
        }
        
        // Replace other variables with sample data
        text = text
          .replace(/\{\{event\.date\}\}/g, 'July 15, 2026')
          .replace(/\{\{event\.venue\}\}/g, 'Miami Beach')
          .replace(/\{\{event\.hashtag\}\}/g, '#EventVibes');

        const x = (field.x / 100) * canvas.width;
        const y = (field.y / 100) * canvas.height;

        ctx.font = `${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
        ctx.textAlign = field.align;
        ctx.textBaseline = 'middle';

        // Draw shadow
        if (field.shadow) {
          ctx.shadowOffsetX = field.shadow.offsetX;
          ctx.shadowOffsetY = field.shadow.offsetY;
          ctx.shadowBlur = field.shadow.blur;
          ctx.shadowColor = field.shadow.color;
        }

        ctx.fillStyle = field.color;
        ctx.fillText(text, x, y);

        // Reset shadow
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        // Draw selection indicator
        if (index === selectedFieldIndex) {
          ctx.strokeStyle = '#9B59B6';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = field.fontSize;
          ctx.strokeRect(x - textWidth / 2 - 10, y - textHeight / 2 - 5, textWidth + 20, textHeight + 10);
          ctx.setLineDash([]);
        }
      });
    };
    img.src = previewImage;
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Update selected field position
    const newFields = [...config.textFields];
    newFields[selectedFieldIndex] = {
      ...newFields[selectedFieldIndex],
      x,
      y
    };
    setConfig({ ...config, textFields: newFields });
  }

  function addTextField() {
    const newField: TextField = {
      id: `field_${Date.now()}`,
      defaultValue: "New Text",
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: "Arial",
      fontWeight: "bold",
      color: "#FFFFFF",
      align: "center",
      shadow: {
        offsetX: 2,
        offsetY: 2,
        blur: 6,
        color: "rgba(0,0,0,0.9)"
      }
    };
    setConfig({ ...config, textFields: [...config.textFields, newField] });
    setSelectedFieldIndex(config.textFields.length);
  }

  function removeTextField(index: number) {
    const newFields = config.textFields.filter((_, i) => i !== index);
    setConfig({ ...config, textFields: newFields });
    setSelectedFieldIndex(Math.max(0, index - 1));
  }

  function updateTextField(index: number, updates: Partial<TextField>) {
    const newFields = [...config.textFields];
    newFields[index] = { ...newFields[index], ...updates };
    setConfig({ ...config, textFields: newFields });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.getToken()}`,
        },
        body: JSON.stringify({
          name,
          config,
          overlayUrl: overlayUrl || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create template');
      }

      setSuccess(true);
      setTimeout(() => navigate('/org/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create template');
    } finally {
      setLoading(false);
    }
  }

  const selectedField = config.textFields[selectedFieldIndex];

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2 font-clash">Template Created!</h2>
            <p className="text-gray-600 font-satoshi">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/org/dashboard" className="text-gray-600 hover:text-charcoal transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-charcoal font-clash">Create Template</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-satoshi">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-charcoal mb-4 font-clash">Live Preview</h2>
                <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="max-w-full h-auto cursor-crosshair rounded-lg shadow-lg"
                    style={{ maxHeight: '600px' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center font-satoshi">
                  Click on canvas to position selected text field
                </p>
              </div>

              {/* Upload Preview Image */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-sm font-bold text-charcoal mb-3 font-satoshi">Preview Image</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setPreviewImage(e.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple file:text-white hover:file:bg-opacity-90 font-satoshi"
                />
              </div>
            </div>

            {/* Right: Controls */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-charcoal mb-4 font-clash">Template Info</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2 font-satoshi">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple focus:bg-white transition font-satoshi"
                      placeholder="Summer Beach Party Template"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2 font-satoshi">
                      Overlay Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={overlayUrl}
                      onChange={(e) => setOverlayUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple focus:bg-white transition font-satoshi"
                      placeholder="https://your-cdn.com/overlay.png"
                    />
                    <p className="mt-2 text-xs text-gray-500 font-satoshi">
                      PNG with transparency for borders/frames
                    </p>
                  </div>
                </div>
              </div>

              {/* Preset Templates */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-charcoal mb-2 font-clash">Start with a Preset</h2>
                <p className="text-sm text-gray-600 mb-4 font-satoshi">
                  Choose a style and customize it to your liking
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {templatePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        const generatedConfig = preset.generate(name || 'Event Name');
                        setConfig(generatedConfig);
                        setSelectedFieldIndex(0);
                      }}
                      className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-purple hover:to-coral hover:text-white rounded-xl border-2 border-gray-200 hover:border-transparent transition group text-left"
                    >
                      <div className="text-3xl mb-2">{preset.thumbnail}</div>
                      <div className="font-semibold text-sm text-charcoal group-hover:text-white font-satoshi">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-500 group-hover:text-white/80 font-satoshi mt-1">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Fields */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-charcoal font-clash">Text Fields</h2>
                  <button
                    type="button"
                    onClick={addTextField}
                    className="px-4 py-2 bg-purple text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition font-satoshi"
                  >
                    + Add Field
                  </button>
                </div>

                {/* Field Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {config.textFields.map((field, index) => (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => setSelectedFieldIndex(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition font-satoshi ${
                        selectedFieldIndex === index
                          ? 'bg-purple text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Field {index + 1}
                    </button>
                  ))}
                </div>

                {/* Selected Field Editor */}
                {selectedField && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2 font-satoshi">
                        Text Content
                      </label>
                      <input
                        type="text"
                        value={selectedField.defaultValue}
                        onChange={(e) => updateTextField(selectedFieldIndex, { defaultValue: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple focus:bg-white transition font-satoshi text-sm"
                        placeholder="{{event.name}}"
                      />
                      <p className="mt-1 text-xs text-gray-500 font-satoshi">
                        Use {'{{event.name}}'}, {'{{event.date}}'}, {'{{event.venue}}'}, {'{{event.hashtag}}'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2 font-satoshi">
                          Font Size
                        </label>
                        <input
                          type="number"
                          value={selectedField.fontSize}
                          onChange={(e) => updateTextField(selectedFieldIndex, { fontSize: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple focus:bg-white transition font-satoshi text-sm"
                          min="12"
                          max="120"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2 font-satoshi">
                          Color
                        </label>
                        <input
                          type="color"
                          value={selectedField.color}
                          onChange={(e) => updateTextField(selectedFieldIndex, { color: e.target.value })}
                          className="w-full h-10 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2 font-satoshi">
                          Font Weight
                        </label>
                        <select
                          value={selectedField.fontWeight}
                          onChange={(e) => updateTextField(selectedFieldIndex, { fontWeight: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple focus:bg-white transition font-satoshi text-sm"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="900">Black</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2 font-satoshi">
                          Alignment
                        </label>
                        <select
                          value={selectedField.align}
                          onChange={(e) => updateTextField(selectedFieldIndex, { align: e.target.value as any })}
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple focus:bg-white transition font-satoshi text-sm"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2 font-satoshi">
                          X Position (%)
                        </label>
                        <input
                          type="number"
                          value={Math.round(selectedField.x)}
                          onChange={(e) => updateTextField(selectedFieldIndex, { x: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple focus:bg-white transition font-satoshi text-sm"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-charcoal mb-2 font-satoshi">
                          Y Position (%)
                        </label>
                        <input
                          type="number"
                          value={Math.round(selectedField.y)}
                          onChange={(e) => updateTextField(selectedFieldIndex, { y: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple focus:bg-white transition font-satoshi text-sm"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                    </div>

                    {config.textFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTextField(selectedFieldIndex)}
                        className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition font-satoshi"
                      >
                        Remove Field
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple to-coral text-white rounded-xl font-semibold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-satoshi"
              >
                {loading ? 'Creating Template...' : 'Create Template'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
