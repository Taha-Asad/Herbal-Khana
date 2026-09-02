// components/contact/ContactForm.tsx
"use client";

import React, { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Send } from "lucide-react";
import { submitContactForm } from "@/app/action/home/contact.actions";
import toast from "react-hot-toast";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        toast.success(result.message);
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });

        // Reset submitted state after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="my-5 bg-white border border-transparent rounded-xl shadow-[0_6px_14px_0_rgba(221,162,0,0.6)] p-8 sm:p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
            Message Sent!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for reaching out. We&apos;ll get back to you within 24-48
            hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 bg-[#DDA200] text-white font-medium rounded-lg 
              hover:bg-[#C49A00] transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="my-5 bg-white border border-transparent rounded-xl 
        shadow-[0_6px_14px_0_rgba(221,162,0,0.6)] 
        transform hover:-translate-y-2 duration-300 relative 
        hover:shadow-[0_10px_22px_0_rgba(221,162,0,0.9),0_0_12px_rgba(221,162,0,0.6)]"
    >
      <div className="p-4 sm:p-6 md:p-8">
        <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-semibold text-[#DDA200]">
          Send a Message
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              id="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              disabled={loading}
              className={`w-full p-3 sm:p-4 border rounded-xl outline-none transition-all
                focus:ring-2 focus:ring-[#DDA200] focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${
                  errors.name ? "border-red-500 bg-red-50" : "border-gray-200"
                }`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              disabled={loading}
              className={`w-full p-3 sm:p-4 border rounded-xl outline-none transition-all
                focus:ring-2 focus:ring-[#DDA200] focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${
                  errors.email ? "border-red-500 bg-red-50" : "border-gray-200"
                }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Subject Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="subject"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              disabled={loading}
              className={`w-full p-3 sm:p-4 border rounded-xl outline-none transition-all
                focus:ring-2 focus:ring-[#DDA200] focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${
                  errors.subject
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
            />
            {errors.subject && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="message"
              className="block text-sm sm:text-base font-medium text-gray-700"
            >
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              id="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows={4}
              disabled={loading}
              className={`w-full p-3 sm:p-4 border rounded-xl outline-none transition-all resize-none
                focus:ring-2 focus:ring-[#DDA200] focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${
                  errors.message
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
            />
            {errors.message && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.message}
              </p>
            )}
            <p className="text-xs text-gray-400 text-right">
              {formData.message.length}/5000
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 sm:py-4 
              text-base sm:text-lg font-semibold rounded-xl transition-all duration-300
              ${
                loading
                  ? "bg-[#C49A00] cursor-not-allowed text-white/80"
                  : "bg-[#DDA200] text-white hover:bg-[#FEFCDF] hover:text-[#DDA200] hover:shadow-[0_0_16px_rgba(255,191,0,0.7)]"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
