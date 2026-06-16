// src/components/product/ProductGallery.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f5f5f4' width='400' height='400'/%3E%3Crect fill='%23e7e5e4' x='100' y='100' width='200' height='200' rx='20'/%3E%3Cpath fill='%23a8a29e' d='M200 150c-27.6 0-50 22.4-50 50s22.4 50 50 50 50-22.4 50-50-22.4-50-50-50zm0 80c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30z'/%3E%3Ccircle fill='%23a8a29e' cx='230' cy='170' r='10'/%3E%3C/svg%3E";

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const displayImages =
    images.length > 0
      ? images
      : [
          {
            id: "placeholder",
            url: PLACEHOLDER_IMAGE,
            alt: productName,
            isPrimary: true,
            sortOrder: 0,
          },
        ];
  const currentImage = displayImages[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const getImageUrl = (index: number) => {
    return imageErrors.has(index)
      ? PLACEHOLDER_IMAGE
      : displayImages[index].url;
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gradient-to-br from-[#FFF9E6] to-stone-100 rounded-2xl overflow-hidden group">
        <Image
          src={getImageUrl(selectedIndex)}
          alt={currentImage.alt || productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-transform duration-500 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
          onError={() => handleImageError(selectedIndex)}
          priority
        />

        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 p-2 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-5 h-5 text-stone-600" />
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full 
                shadow-lg opacity-0 group-hover:opacity-100 transition-opacity
                hover:bg-white text-stone-600 hover:text-[#DDA200]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full 
                shadow-lg opacity-0 group-hover:opacity-100 transition-opacity
                hover:bg-white text-stone-600 hover:text-[#DDA200]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 
            rounded-full text-white text-sm font-medium"
          >
            {selectedIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden 
                border-2 transition-all duration-200
                ${
                  selectedIndex === index
                    ? "border-[#DDA200] ring-2 ring-[#DDA200]/30"
                    : "border-stone-200 hover:border-[#DDA200]/50"
                }`}
            >
              <Image
                src={getImageUrl(index)}
                alt={image.alt || `${productName} - ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-4">
            <Image
              src={getImageUrl(selectedIndex)}
              alt={currentImage.alt || productName}
              fill
              sizes="100vw"
              className="object-contain"
              onError={() => handleImageError(selectedIndex)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
