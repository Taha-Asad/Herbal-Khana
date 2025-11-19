"use client";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

function Form() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  return (
    <div className="my-5 bg-white border border-transparent rounded-xl shadow-[0_6px_14px_0_rgba(221,162,0,0.6)] transform hover:-translate-y-4 duration-300 relative hover:shadow-[0_10px_22px_0_rgba(221,162,0,0.9),0_0_12px_rgba(221,162,0,0.6)]">
      <div className="p-6 sm:p-8">
        <h3 className="mb-5 text-3xl sm:text-4xl font-semibold text-[#DDA200]">
          Send a Message
        </h3>

        <form onClick={handleSubmit} className="space-y-4">
          <label htmlFor="name">Name:</label>
          <input
            name="name"
            id="name"
            type="text"
            placeholder="Your Name"
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#DDA200]"
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Your Email"
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#DDA200]"
          />

          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            name="subject"
            id="subject"
            placeholder="Subject"
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#DDA200]"
          />

          <label htmlFor="message">Message:</label>
          <textarea
            name="message"
            id="message"
            placeholder="Your Message"
            rows={4}
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#DDA200]"
          ></textarea>

          <div className="grid place-items-center">
            <button
              type="submit"
              disabled={loading}
              className={`flex w-full py-3 text-white text-lg font-medium rounded-lg transition-all items-center justify-center gap-2 duration-300 hover:text-[#DDA200] 
                        ${
                          loading
                            ? "bg-[#C49A00] cursor-not-allowed"
                            : "bg-[#DDA200] hover:bg-[#FEFCDF] text-[#DDA200] hover:shadow-[0_0_12px_rgba(255,191,0,0.7)]"
                        }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 text-[#DDA200] animate-spin" />
                  Sending...
                </>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Form;
