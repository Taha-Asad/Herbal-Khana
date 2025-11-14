"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
const beforeAfterData = [
  {
    id: 1,
    title: "Hair Growth Transformation",
    before:
      "https://images.unsplash.com/photo-1747324831504-5ee9aa8eec59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsb3dpbmclMjBza2luJTIwbmF0dXJhbHxlbnwxfHx8fDE3NjI3OTA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    after:
      "https://images.unsplash.com/photo-1729337531424-198f880cb6c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGFzaWFuJTIwd29tYW4lMjBza2luY2FyZXxlbnwxfHx8fDE3NjI3OTA4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "8 weeks",
    product: "Herbal Hair Growth Oil",
  },
  {
    id: 2,
    title: "Radiant Skin Results",
    before:
      "https://images.unsplash.com/photo-1729337531424-198f880cb6c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3V0aCUyMGFzaWFuJTIwd29tYW4lMjBza2luY2FyZXxlbnwxfHx8fDE3NjI3OTA4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    after:
      "https://images.unsplash.com/photo-1747324831504-5ee9aa8eec59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsb3dpbmclMjBza2luJTIwbmF0dXJhbHxlbnwxfHx8fDE3NjI3OTA4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    duration: "6 weeks",
    product: "Natural Glow Face Cream",
  },
];
function Transformations() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const current = beforeAfterData[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? beforeAfterData.length - 1 : prev - 1
    );
    setSliderPosition(50);
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === beforeAfterData.length - 1 ? 0 : prev + 1
    );
    setSliderPosition(50);
  };

  return (
    <div className="relative my-10 bg-gradient-to-br from-white via-[#FFF8E1] to-white py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto">
        <div className="flex flex-col items-center">
          <div className="rounded-full border-1 border border-[#DDA200] text-[#DDA200] bg-[#FEFCDF] w-auto py-2 px-4 my-3">
            <span>Transformations</span>
          </div>
          <h2 className="text-4xl text-center py-3">
            Real Results, Real People
          </h2>
          <p className="text-xl text-black/60 leading-relaxed max-w-2xl text-center">
            See the transformative power of our herbal products. These are real
            results from our valued customers.
          </p>{" "}
        </div>
        <div className="max-w-4xl mx-auto py-5">
          <div className="bg-gradient-to-br from-[#FEFCDF] to-white rounded-[2rem] p-8 shadow-2xl border border-white/50">
            <div className="mb-6 text-center">
              <h3 className="text-black mb-2">{current.title}</h3>
              <div className="inline-flex items-center gap-2 bg-[#DDA200]/10 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-[#DDA200] rounded-full animate-pulse" />
                <p className="text-[#DDA200]">
                  Using {current.product} for {current.duration}
                </p>
              </div>
            </div>

            {/* Before/After Slider */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
              {/* After Image */}
              <Image
                src={current.after}
                alt="After"
                fill
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Before Image with clip */}
              <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <Image
                  src={current.before}
                  alt="Before"
                  fill
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Slider Control */}
              <div
                ref={sliderRef}
                className="absolute top-0 bottom-0 w-1 bg-[#DDA200] cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={() => {
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    if (!sliderRef.current?.parentElement) return;
                    const rect =
                      sliderRef.current.parentElement.getBoundingClientRect();
                    const x = moveEvent.clientX - rect.left;
                    const percentage = (x / rect.width) * 100;
                    setSliderPosition(Math.max(0, Math.min(100, percentage)));
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                  };

                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#DDA200] rounded-full flex items-center justify-center shadow-lg">
                  <div className="flex gap-1">
                    <ChevronLeft className="w-4 h-4 text-white" />
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full">
                Before
              </div>
              <div className="absolute top-4 right-4 bg-[#DDA200] text-white px-4 py-2 rounded-full">
                After
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrevious}
                className="z-100 w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                {beforeAfterData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setSliderPosition(50);
                    }}
                    className={`z-100 w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-[#DDA200] w-8"
                        : "bg-black/20"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors z-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transformations;
