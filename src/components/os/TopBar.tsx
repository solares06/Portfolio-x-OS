"use client";

import React, { useState, useEffect } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { getDynamicNotifications } from "@/lib/actions/dashboard";

export default function TopBar() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const notifs = await getDynamicNotifications();
        setNotifications(notifs);
      } catch (e) {
        console.error(e);
      }
    }
    loadNotifications();
  }, []);

  return (
    <div className="h-16 border-b border-card-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-4">
        {/* Mobile menu placeholder if needed */}
        <button className="md:hidden text-on-surface-variant hover:text-on-surface">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Command palette (Ctrl+K)"
            className="w-64 bg-surface-container-low border border-outline-variant rounded-full py-1.5 pl-9 pr-4 text-sm font-mono focus:border-primary-container outline-none text-on-surface transition-colors"
            disabled
          />
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-full hover:bg-surface-container-high"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-pulse shadow-[0_0_8px_rgba(255,84,73,0.8)]"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container border border-outline-variant rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-display font-bold text-on-surface">Notifications</h3>
                <span className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant font-mono text-sm">
                    You're all caught up!
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {notifications.map((n, i) => (
                      <div 
                        key={i}
                        className={`p-3 rounded-lg border flex flex-col gap-1 transition-colors ${
                          n.type === 'error' 
                            ? 'bg-error/5 border-error/20' 
                            : 'bg-secondary-container/5 border-secondary-container/20'
                        }`}
                      >
                        <div className={`font-bold text-sm ${n.type === 'error' ? 'text-error' : 'text-secondary-container'}`}>
                          {n.title}
                        </div>
                        <div className="text-xs text-on-surface-variant font-mono">
                          {n.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
