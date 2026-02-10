'use client';

import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const ZOOM_LEVELS = [85, 90, 100, 110, 120, 130];
const DEFAULT_ZOOM = 100;

const ZoomControl: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedZoom = localStorage.getItem('mycounselor_zoom');
    if (savedZoom) {
      const zoom = parseInt(savedZoom, 10);
      if (ZOOM_LEVELS.includes(zoom)) {
        setZoomLevel(zoom);
        document.documentElement.style.fontSize = `${zoom}%`;
      }
    }
  }, []);

  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
    document.documentElement.style.fontSize = `${newZoom}%`;
    localStorage.setItem('mycounselor_zoom', newZoom.toString());
    setIsDropdownOpen(false);
  };

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      handleZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex > 0) {
      handleZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors" aria-label="Zoom out">
          <div className="w-4 h-4" />
        </button>
        <button className="px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-xs font-medium min-w-[40px]">
          100%
        </button>
        <button className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors" aria-label="Zoom in">
          <div className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const canZoomOut = ZOOM_LEVELS.indexOf(zoomLevel) > 0;
  const canZoomIn = ZOOM_LEVELS.indexOf(zoomLevel) < ZOOM_LEVELS.length - 1;

  return (
    <div className="flex items-center gap-1">
      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        disabled={!canZoomOut}
        className={`p-1.5 rounded-lg transition-all duration-200 focus-ring ${
          canZoomOut
            ? 'bg-muted hover:bg-muted/80 text-foreground'
            : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
        }`}
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Icon name="MinusIcon" size={16} variant="outline" />
      </button>

      {/* Zoom Level Display / Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="px-2 py-1 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-xs font-medium min-w-[44px] focus-ring flex items-center justify-center gap-1"
          aria-label={`Current zoom: ${zoomLevel}%`}
          title="Click to select zoom level"
        >
          <span>{zoomLevel}%</span>
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[#292929] rounded-lg shadow-lg border border-[#DADCE0] dark:border-[#3C4043] py-1 z-50 min-w-[80px]">
              {ZOOM_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleZoomChange(level)}
                  className={`w-full px-3 py-1.5 text-xs font-medium text-left hover:bg-[#F1F3F4] dark:hover:bg-[#3C4043] transition-colors ${
                    level === zoomLevel
                      ? 'text-[#1A73E8] bg-[#E8F0FE]'
                      : 'text-[#202124] dark:text-[#E8EAED]'
                  }`}
                >
                  {level}%
                  {level === 100 && (
                    <span className="ml-1 text-[#5F6368] dark:text-[#9AA0A6]">(Default)</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        disabled={!canZoomIn}
        className={`p-1.5 rounded-lg transition-all duration-200 focus-ring ${
          canZoomIn
            ? 'bg-muted hover:bg-muted/80 text-foreground'
            : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
        }`}
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Icon name="PlusIcon" size={16} variant="outline" />
      </button>
    </div>
  );
};

export default ZoomControl;
