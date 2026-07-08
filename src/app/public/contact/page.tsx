"use client";

import React, { useState } from "react";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-20 pb-12 pt-4 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <section className="space-y-4">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1]">
          Let&apos;s build something <br className="hidden sm:block" />
          <em className="italic font-normal text-gray-500">meaningful together.</em>
        </h1>
        <p className="max-w-xl text-base sm:text-lg text-foreground/70 leading-relaxed">
          I am currently accepting new freelance projects and full-time opportunities. If you have a project in mind, or just want to chat about design, feel free to reach out.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
        
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-card-border p-8 sm:p-12 rounded-theme shadow-theme">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full bg-transparent border-b border-gray-300 focus:border-primary px-0 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full bg-transparent border-b border-gray-300 focus:border-primary px-0 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full bg-transparent border-b border-gray-300 focus:border-primary px-0 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors"
                placeholder="Project Inquiry"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="w-full bg-transparent border-b border-gray-300 focus:border-primary px-0 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors resize-none"
                placeholder="Tell me about your project..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting" || status === "success"}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-70 group"
            >
              {status === "idle" && (
                <>
                  Send Message
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </>
              )}
              {status === "submitting" && "Sending..."}
              {status === "success" && "Message Sent!"}
            </button>
            
            {status === "success" && (
              <p className="text-sm text-green-600 font-medium pt-2">
                Thanks for reaching out! I&apos;ll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600 font-medium pt-2">
                Something went wrong. Please try again or email directly.
              </p>
            )}
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-12 lg:pt-4">
          <div className="space-y-6">
            <h3 className="font-display text-xl font-bold text-gray-900">
              Direct Contact
            </h3>
            <div className="space-y-4">
              <a href="mailto:hello@example.com" className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span>hello@example.com</span>
              </a>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-display text-xl font-bold text-gray-900">
              Socials
            </h3>
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-sm font-semibold uppercase tracking-wider text-gray-500 hover:text-primary transition-colors flex items-center gap-2 group">
                LinkedIn
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </a>
              <a href="#" className="text-sm font-semibold uppercase tracking-wider text-gray-500 hover:text-primary transition-colors flex items-center gap-2 group">
                Twitter / X
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </a>
              <a href="#" className="text-sm font-semibold uppercase tracking-wider text-gray-500 hover:text-primary transition-colors flex items-center gap-2 group">
                Instagram
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </a>
              <a href="#" className="text-sm font-semibold uppercase tracking-wider text-gray-500 hover:text-primary transition-colors flex items-center gap-2 group">
                Dribbble
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
              </a>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
