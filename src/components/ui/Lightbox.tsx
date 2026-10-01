import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCcw } from 'lucide-react';

export interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  altText?: string;
  title?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  imageSrc,
  altText = 'Course diagram',
  title,
}) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/50 border-b border-white/10 text-white z-10">
        <div className="text-sm font-medium truncate max-w-md">
          {title || altText}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono text-white/70 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            title="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <a
            href={imageSrc}
            download
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            title="Download image"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 cursor-grab active:cursor-grabbing">
        <img
          src={imageSrc}
          alt={altText}
          style={{ transform: `scale(${scale})`, transition: 'transform 0.15s ease' }}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
        />
      </div>
    </div>
  );
};
