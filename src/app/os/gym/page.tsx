"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Bell,
  Clock,
  Play,
  Upload,
  Image as ImageIcon,
  Plus
} from "lucide-react";
import { getWeeklySplit, getBodyMetrics, getWorkoutDay } from "@/lib/actions/gym";
import { WeeklySplitDay, BodyMetrics, WorkoutDay } from "@/lib/mock-data";

export default function OSGymPage() {
  const [weeklySplit, setWeeklySplit] = useState<WeeklySplitDay[]>([]);
  const [metrics, setMetrics] = useState<BodyMetrics | null>(null);
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [split, m, day] = await Promise.all([
          getWeeklySplit(),
          getBodyMetrics(),
          getWorkoutDay()
        ]);
        setWeeklySplit(split);
        setMetrics(m);
        setWorkoutDay(day);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8">Loading Gym Telemetry...</div>;
  if (!metrics || !workoutDay) return <div className="p-8 text-on-surface-variant">No gym data found. Please run migrations and seed data.</div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 space-y-6 h-full custom-scrollbar relative bg-background">
      
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="font-display text-2xl font-black text-on-surface tracking-tight">
              Core_OS<span className="text-primary-container">.gym</span>
            </div>
          </div>
          
          <div className="flex-1 w-full md:max-w-md md:mx-8">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary-container transition-colors" />
              <input 
                type="text"
                placeholder="Search exercises, logs..." 
                className="w-full bg-[#0a0a0c] border-0 border-b border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface font-mono text-sm py-2 pl-10 pr-4 transition-all duration-300 placeholder:text-outline focus:shadow-[0_2px_12px_-2px_rgba(0,242,255,0.2)]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 hidden md:flex">
            <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer relative group p-2 rounded-full hover:bg-surface-variant">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-container rounded-full neon-glow"></span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-surface-variant">
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Weekly Split */}
          <div className="md:col-span-12 glass-panel p-6 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl text-on-surface font-bold">Weekly Split</h2>
              <span className="px-3 py-1 bg-primary-container/10 border border-primary-container/30 text-primary-container font-mono text-xs rounded uppercase tracking-widest">
                Current Routine
              </span>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {weeklySplit.map(day => (
                <div 
                  key={day.id} 
                  className={`p-4 rounded-lg text-center transition-all ${
                    day.isActive 
                      ? 'bg-primary-container/20 border border-primary-container neon-glow' 
                      : 'bg-surface-container-high border border-outline-variant/30'
                  }`}
                >
                  <div className={`font-mono text-xs mb-1 uppercase ${day.isActive ? 'text-primary-container font-bold' : 'text-primary'}`}>
                    {day.dayLabel}
                  </div>
                  <div className={`font-body text-sm ${day.isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {day.type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Card */}
          <div className="glass-panel p-6 rounded-xl md:col-span-4 flex flex-col group hover:border-primary-container/50 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-display text-2xl text-on-surface font-bold">Body Metrics</h2>
                <p className="font-mono text-xs text-on-surface-variant mt-1 uppercase tracking-widest">Live Telemetry</p>
              </div>
              <div className="text-primary-container animate-pulse">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.4C4 10.4 6 7 12 7s8 3.4 8 3.4"/><path d="M6 14.4c0 0 2-2.4 6-2.4s6 2.4 6 2.4"/><path d="M12 18.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/></svg>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-mono text-xs text-outline uppercase tracking-widest">Weight</span>
                  <span className="text-xs text-primary-container font-mono">{metrics.weight.delta}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-primary">{metrics.weight.value}</span>
                  <span className="font-mono text-sm text-on-surface-variant">{metrics.weight.unit}</span>
                </div>
                {/* Faux trend line */}
                <div className="mt-4 h-12 w-full flex items-end gap-1 opacity-80">
                  <div className="w-full bg-surface-container-high h-[40%] rounded-t-sm hover:bg-primary-container/30 transition-colors"></div>
                  <div className="w-full bg-surface-container-high h-[45%] rounded-t-sm hover:bg-primary-container/30 transition-colors"></div>
                  <div className="w-full bg-surface-container-high h-[42%] rounded-t-sm hover:bg-primary-container/30 transition-colors"></div>
                  <div className="w-full bg-surface-container-high h-[50%] rounded-t-sm hover:bg-primary-container/30 transition-colors"></div>
                  <div className="w-full bg-surface-container-high h-[60%] rounded-t-sm hover:bg-primary-container/30 transition-colors"></div>
                  <div className="w-full bg-primary-container h-[65%] rounded-t-sm neon-glow"></div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-outline-variant/30">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-mono text-xs text-outline uppercase tracking-widest">Body Fat</span>
                  <span className="text-xs text-primary-container font-mono">{metrics.bodyFat.delta}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-bold text-primary">{metrics.bodyFat.value}</span>
                  <span className="font-mono text-sm text-on-surface-variant">{metrics.bodyFat.unit}</span>
                </div>
                {/* Progress Bar */}
                <div className="mt-3 w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container neon-glow relative" style={{ width: `${metrics.bodyFat.progress}%` }}>
                    <div className="absolute right-0 top-0 h-full w-4 bg-white blur-[2px]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Split / Routine */}
          <div className="glass-panel rounded-xl md:col-span-8 flex flex-col group hover:border-primary-container/50 transition-colors duration-300">
            <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest/50 rounded-t-xl">
              <div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-primary-container/10 border border-primary-container/30 text-primary-container font-mono text-xs rounded uppercase tracking-widest font-bold">
                    {workoutDay.dayId}
                  </span>
                  <h2 className="font-display text-2xl text-on-surface font-bold">{workoutDay.title}</h2>
                </div>
                <p className="font-body text-sm text-on-surface-variant mt-2">Est. Duration: {workoutDay.duration} | Intensity: {workoutDay.intensity}</p>
              </div>
              <button className="w-12 h-12 rounded-full border border-primary-container text-primary-container flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-all hover:neon-glow group/btn shrink-0">
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
            
            <div className="flex-1 p-0 overflow-y-auto max-h-[500px] custom-scrollbar">
              {workoutDay.exercises.map((ex) => (
                <div 
                  key={ex.id} 
                  className={`p-6 border-b border-outline-variant/20 hover:bg-surface-variant/30 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center ${ex.isFaded ? 'opacity-50 hover:opacity-80' : ''}`}
                >
                  <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center border border-outline-variant/50 shrink-0">
                    <span className="font-mono text-sm text-outline">{ex.order}</span>
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-body text-lg font-bold text-primary truncate">{ex.name}</h3>
                    <p className="font-mono text-xs text-on-surface-variant mt-1">Target: {ex.target}</p>
                  </div>
                  <div className="flex gap-4 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                    {ex.sets.map((set) => (
                      <div 
                        key={set.id} 
                        className={`px-3 py-2 min-w-[80px] ${
                          set.isActive 
                            ? 'bg-[#0a0a0c] border-b border-primary-container relative overflow-hidden' 
                            : 'bg-[#0a0a0c] border-b border-outline-variant'
                        } ${set.isFaded ? 'opacity-50' : ''}`}
                      >
                        {set.isActive && (
                          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-container neon-glow"></div>
                        )}
                        <div className={`font-mono text-[10px] mb-1 uppercase tracking-widest ${set.isActive ? 'text-primary-container font-bold' : 'text-outline'}`}>
                          {set.label}
                        </div>
                        <div className={`font-mono text-xs ${set.isActive ? 'text-primary' : 'text-on-surface'}`}>
                          {set.details}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Journey */}
          <div className="glass-panel p-6 rounded-xl md:col-span-12 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-primary-container" />
                <h2 className="font-display text-2xl text-on-surface font-bold">Growth Journey</h2>
              </div>
              <button className="px-4 py-2 bg-surface-container-high border border-outline-variant/50 rounded font-mono text-xs uppercase tracking-widest hover:bg-surface-variant transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload Photo
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="aspect-square rounded-lg overflow-hidden border border-outline-variant/30 group relative cursor-pointer">
                <Image 
                  alt="Progress photo" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400"
                  width={200}
                  height={200}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="font-mono text-xs text-white">2023.10.24</span>
                </div>
              </div>
              
              <div className="aspect-square rounded-lg border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-2 hover:border-primary-container/50 hover:bg-primary-container/5 transition-all cursor-pointer group">
                <Plus className="w-6 h-6 text-outline group-hover:text-primary-container transition-colors" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-outline group-hover:text-primary-container transition-colors">Add Photos</span>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Bottom spacing */}
        <div className="h-24 md:h-8"></div>
      </div>
    </div>
  );
}
