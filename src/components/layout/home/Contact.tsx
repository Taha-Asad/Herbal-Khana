import Form from "@/components/ui/Form";
import { MessageCircle } from "lucide-react";
import React from "react";

function Contact() {
  return (
    <div className="overflow-hidden my-5 py-16 sm:py-20 bg-gradient-to-br from-white via-[#FFF8E1] to-white relative">
      <div className="opacity-20 absolute inset-0">
        <div className="w-72 sm:w-96 h-72 sm:h-96 bg-[#DDA200]/20 rounded-full absolute top-1/4 left-0 blur-3xl" />
        <div className="w-72 sm:w-96 h-72 sm:h-96 bg-[#DDA200]/20 rounded-full absolute bottom-1/4 right-0 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="w-auto py-1.5 px-4 my-3 text-[#DDA200] bg-[#FEFCDF] rounded-full border border-[#DDA200]">
            <span>Contact</span>
          </div>

          <h2 className="py-3 text-3xl sm:text-4xl text-center">
            Get in Touch
          </h2>

          <p className="max-w-2xl text-base sm:text-xl text-black/60 leading-relaxed text-center px-2">
            Have questions about our products? We&apos;re here to help! Send us
            a message or reach out on WhatsApp.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
            {/* LEFT: FORM */}
            <Form />

            {/* RIGHT SIDE */}
            <div className="flex flex-col">
              {/* WhatsApp CARD */}
              <div className="flex-1 my-5 bg-white border border-transparent rounded-xl shadow-[0_6px_14px_0_rgba(221,162,0,0.6)] transform hover:-translate-y-4 duration-300 hover:shadow-[0_10px_22px_0_rgba(221,162,0,0.9),0_0_12px_rgba(221,162,0,0.6)]">
                <div className="flex flex-col p-6 sm:p-8 items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full shadow-lg flex items-center justify-center">
                    <MessageCircle
                      size={36}
                      className="sm:size-42"
                      color="white"
                    />
                  </div>

                  <h3 className="mt-4 text-lg sm:text-xl font-semibold">
                    Prefer WhatsApp?
                  </h3>
                  <p className="mt-2 text-gray-600 text-center">
                    Reach us instantly through our WhatsApp support.
                  </p>

                  <a
                    href="https://wa.me/923001234567"
                    target="_blank"
                    className="mt-5 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 duration-300"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {/* ADDRESS CARD */}
              <div className="my-5 bg-white border border-transparent rounded-xl shadow-[0_6px_14px_0_rgba(221,162,0,0.6)] transform hover:-translate-y-4 duration-300 hover:shadow-[0_10px_22px_0_rgba(221,162,0,0.9),0_0_12px_rgba(221,162,0,0.6)]">
                <div className="p-6 sm:p-8">
                  <h3 className="mb-4 text-xl sm:text-2xl font-semibold text-[#DDA200]">
                    Store Location
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    <strong>Address:</strong> Shop #12, Main Market, Lahore,
                    Pakistan
                  </p>

                  <p className="mt-4 text-gray-600">
                    <strong>Email:</strong> support@store.com
                  </p>

                  <p className="mt-4 text-gray-600">
                    <strong>Open:</strong> Mon - Sat, 10am - 8pm
                  </p>

                  <p className="mt-2 text-gray-600">
                    <strong>Phone:</strong> +92 300 1234567
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
