// DelayedSlider.tsx ("use client")
"use client";
import React, { useState, useEffect } from "react";
import Slider from "../components/ui/Slider";

export default function DelayedSlider() {
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    // Delay slider rendering by 1 second (or more)
    const timer = setTimeout(() => setShowSlider(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSlider ? (
        <Slider />
      ) : (
        <div className="w-full h-[50vh] bg-gray-100 rounded-2xl" />
      )}
    </>
  );
}
