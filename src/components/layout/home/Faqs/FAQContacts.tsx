import { Mail, MessageCircle, Phone } from "lucide-react";
import React from "react";

function FAQContacts() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2]">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Still have questions?
        </h2>
        <p className="text-gray-600 mb-8">
          Can&apos;t find the answer you&apos;re looking for? Our support team
          is here to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl border border-[#f3e4b7] hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#DDA200]/10 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#DDA200]" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">
              Chat with our support team
            </p>
            <button className="w-full py-2 bg-[#DDA200] text-white font-medium rounded-lg hover:bg-[#b38600] transition-colors">
              Start Chat
            </button>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#f3e4b7] hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#DDA200]/10 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#DDA200]" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Email Us</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get response within 24 hours
            </p>
            <a
              href="mailto:support@example.com"
              className="block w-full py-2 bg-[#DDA200] text-white font-medium rounded-lg hover:bg-[#b38600] transition-colors"
            >
              Send Email
            </a>
          </div>

          <div className="p-6 bg-white rounded-xl border border-[#f3e4b7] hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-4 bg-[#DDA200]/10 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-[#DDA200]" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Call Us</h3>
            <p className="text-sm text-gray-600 mb-4">Mon-Fri, 9am-6pm EST</p>
            <a
              href="tel:+1234567890"
              className="block w-full py-2 bg-[#DDA200] text-white font-medium rounded-lg hover:bg-[#b38600] transition-colors"
            >
              1-234-567-890
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQContacts;
