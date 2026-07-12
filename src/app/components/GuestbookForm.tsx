"use client";

import { useState } from "react";
import { addGuestbookEntry } from "@/lib/actions/portfolio";
import { Send } from "lucide-react";

export function GuestbookForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    
    setLoading(true);
    try {
      await addGuestbookEntry(name, message);
      setSuccess(true);
      setName("");
      setMessage("");
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to submit message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input
            id="name"
            type="text"
            required
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="Jane Doe"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">Message</label>
        <textarea
          id="message"
          required
          maxLength={500}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
          placeholder="What's on your mind?"
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading || !name || !message}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Submit <Send className="w-4 h-4" /></>
          )}
        </button>
        {success && (
          <span className="text-green-500 text-sm font-medium animate-in fade-in">
            Message posted!
          </span>
        )}
      </div>
    </form>
  );
}
