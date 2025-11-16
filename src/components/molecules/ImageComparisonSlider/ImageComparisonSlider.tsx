import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show the pulsing animation for the first 3 seconds to teach the user
    const timer = setTimeout(() => setShowPulse(false), 3000);
    return () => clearTimeout(timer);
  }, []);


  const handleMove = useCallback((clientX: number) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newPosition = ((clientX - rect.left) / rect.width) * 100;

    // Clamp the position between 0 and 100
    newPosition = Math.max(0, Math.min(100, newPosition));

    setSliderPosition(newPosition);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden rounded-lg group"
    >
      {/* Before Image (Top Layer, left side) */}
      <div className="absolute inset-0 z-10">
        <img
          src={beforeImage}
          alt="Before"
          className="w-full h-full object-contain pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold py-1 px-3 rounded-full pointer-events-none">
          BEFORE
        </div>
      </div>

      {/* After Image (Bottom Layer, right side) */}
      <div className="w-full h-full">
        <img src={afterImage} alt="After" className="w-full h-full object-contain pointer-events-none" />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold py-1 px-3 rounded-full pointer-events-none">
          AFTER
        </div>
      </div>

      {/* Slider Handle Assembly */}
      <div
        className="absolute top-0 bottom-0 z-20 cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        aria-valuenow={sliderPosition}
        aria-valuemin={0}
        aria-valuemax={100}
        role="slider"
        aria-label="Image comparison slider"
      >
        {/* Invisible larger touch area for mobile */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-full"></div>
        
        {/* Visible Line */}
        <div className="absolute top-0 bottom-0 w-1 bg-white/80 backdrop-blur-sm" />

        {/* Visible Circle Handle with animation */}
        <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white/80 border-2 border-white flex items-center justify-center shadow-lg transition-opacity duration-300 ${showPulse ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};
