import React from "react";

function Contact() {
  return (
    <div className="relative my-5 bg-gradient-to-br from-white via-[#FFF8E1] to-white py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto">
        <div className="flex flex-col items-center">
          <div className="rounded-full border-1 border border-[#DDA200] text-[#DDA200] bg-[#FEFCDF] w-auto py-2 px-4 my-3">
            <span>Contact</span>
          </div>
          <h2 className="text-4xl text-center py-3">Get in Touch</h2>
          <p className="text-xl text-black/60 leading-relaxed max-w-2xl text-center">
            Have questions about our products? We&apos;re here to help! Send us
            a message or reach out on WhatsApp.
          </p>{" "}
        </div>
      </div>
    </div>
  );
}

export default Contact;
