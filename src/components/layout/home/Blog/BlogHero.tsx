import React from "react";

function BlogHero() {
  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] overflow-hidden py-30">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center blur-[8px] brightness-80"
        style={{
          backgroundImage: "url('/heroback.jpg')",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Left gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:40px_40px]" />

      {/* Content */}
      <div className="relative z-10 h-full px-5 py-5 gap-8">
        {/* Left Content */}
        <div className="flex flex-col justify-center items-start px-8 py-10">
          <h1 className="text-5xl py-2 text-[#DDA200] font-[Inter]">
            Beauty & Wellness Blog{" "}
          </h1>

          <p className="py-3 text-xl text-white/80 leading-relaxed max-w-3xl">
            Expert tips, natural remedies, and the latest insights on herbal
            beauty care.
          </p>
        </div>
        {/* Bottom fade */}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FEFCDF] to-transparent z-5" />
    </div>
  );
}

export default BlogHero;
