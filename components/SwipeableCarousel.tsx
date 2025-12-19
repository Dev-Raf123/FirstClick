"use client";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeableCarouselProps {
  children: React.ReactNode[];
  onSlideChange?: (index: number) => void;
}

export function SwipeableCarousel({ 
  children, 
  onSlideChange,
}: SwipeableCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (onSlideChange) {
      onSlideChange(index);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < children.length - 1) {
      goToSlide(currentIndex + 1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Swipe threshold of 50px
    if (dragOffset < -50 && currentIndex < children.length - 1) {
      goToSlide(currentIndex + 1);
    } else if (dragOffset > 50 && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
    
    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragOffset < -50 && currentIndex < children.length - 1) {
      goToSlide(currentIndex + 1);
    } else if (dragOffset > 50 && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
    
    setDragOffset(0);
  };

  return (
    <div className="relative w-full">
      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all backdrop-blur shadow-xl"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      
      {currentIndex < children.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all backdrop-blur shadow-xl"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Carousel Container */}
      <div 
        ref={containerRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-all duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? dragOffset : 0}px))`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="min-w-full flex justify-center items-center px-16 py-8"
              style={{
                opacity: index === currentIndex ? 1 : 0.4,
                transform: `scale(${index === currentIndex ? 1 : 0.9})`,
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
              }}
            >
              <div className="w-full max-w-xs">
                {child}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page Indicator */}
      <div className="flex justify-center items-center gap-3 mt-8">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-10 h-3 bg-indigo-500'
                : 'w-3 h-3 bg-neutral-600 hover:bg-neutral-500'
            }`}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>

      {/* Page Counter */}
      <div className="text-center mt-4 text-neutral-400 text-sm">
        {currentIndex + 1} / {children.length}
      </div>
    </div>
  );
}
