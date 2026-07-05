"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Bell,
  Clock,
  Filter,
  AlertCircle,
  MoreVertical,
  Activity,
  ArrowRight,
  Users,
  Mail,
  ImageIcon,
  LayoutGrid
} from "lucide-react";
import { getDirectives, getSponsorshipStats, getTeam, getArchive } from "@/lib/actions/extracurricular";
import type { SponsorshipStat, TeamMember, ArchivePhoto } from "@/lib/mock-data";

type Directive = { id: string; type: string; typeLabel: string; title: string; subtitle?: string; color: string };

export default function OSExtracurricularPage() {
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [stats, setStats] = useState<SponsorshipStat[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [archive, setArchive] = useState<ArchivePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [d, s, t, a] = await Promise.all([
          getDirectives(),
          getSponsorshipStats(),
          getTeam(),
          getArchive()
        ]);
        setDirectives(d);
        setStats(s);
        setTeam(t);
        setArchive(a);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getDirectiveBorderColor = (color: string) => {
    switch (color) {
      case 'primary': return 'border-primary-container';
      case 'tertiary': return 'border-tertiary-container';
      default: return 'border-outline';
    }
  };

  const getDirectiveTextColor = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary-container';
      case 'tertiary': return 'text-tertiary-container';
      default: return 'text-on-surface-variant';
    }
  };

  const getTrendColor = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary-container';
      case 'tertiary': return 'text-tertiary-container';
      default: return 'text-outline';
    }
  };

  const getProgressBgColor = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-primary-container shadow-[0_0_8px_rgba(0,242,255,0.8)]';
      case 'on-surface': return 'bg-on-surface';
      default: return 'bg-outline';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-full w-full bg-background text-on-background overflow-y-auto custom-scrollbar">
      
      {/* TopAppBar */}
      <header className="bg-surface border-b border-outline-variant flex justify-between items-center h-16 px-4 md:px-8 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <h2 className="font-display text-2xl font-black text-on-surface neon-text">Core_OS</h2>
          <div className="hidden lg:flex items-center gap-2 bg-surface-container-high border border-outline-variant rounded-full px-4 py-1.5 focus-within:border-primary-container focus-within:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search modules..." 
              className="bg-transparent border-none text-sm focus:ring-0 text-on-surface w-64 placeholder:text-on-surface-variant p-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Clock className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all ml-2 cursor-pointer">
            <Image 
              src="https://picsum.photos/seed/user/100/100" 
              alt="User" 
              width={32} 
              height={32} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 flex flex-col gap-6 max-w-[1440px] mx-auto w-full flex-1">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-primary-container border border-primary-container/30 bg-primary-container/10 px-2 py-1 rounded uppercase tracking-widest font-bold">MODULE: E-CELL</span>
              <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">SYS.STATE: ACTIVE</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-on-surface font-bold tracking-tight">E-Cell Command Center</h1>
          </div>
          <div className="flex gap-2">
            <button className="bg-transparent border border-primary-container text-primary-container font-mono text-xs py-2 px-4 rounded hover:bg-primary-container/10 transition-colors neon-glow uppercase tracking-widest font-bold">
              Export Data
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6">
          
          {/* Active Directives (Mapped to Projects) */}
          <div className="col-span-4 lg:col-span-4 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full blur-xl pointer-events-none"></div>
            <h3 className="font-display text-xl text-on-surface mb-6 flex items-center gap-2 font-bold">
              <AlertCircle className="w-6 h-6 text-primary-container" />
              Active Directives
            </h3>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-on-surface-variant font-mono text-sm text-center py-4">Loading from database...</div>
              ) : directives.length === 0 ? (
                <div className="text-on-surface-variant font-mono text-sm text-center py-4">No active directives.</div>
              ) : directives.map(dir => (
                <div key={dir.id} className={`bg-surface-container-high border-l-2 ${getDirectiveBorderColor(dir.color)} p-3 rounded-r-lg group-hover:bg-surface-variant transition-colors`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-mono text-[10px] uppercase tracking-widest font-bold ${getDirectiveTextColor(dir.color)}`}>
                      {dir.typeLabel}
                    </span>
                    <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                  </div>
                  <p className="font-body text-sm text-on-surface mb-1 font-medium">{dir.title}</p>
                  {dir.subtitle && (
                    <span className="font-mono text-xs text-outline line-clamp-1">{dir.subtitle}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sponsorship Telemetry */}
          <div className="col-span-4 md:col-span-8 lg:col-span-8 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all">
            <h3 className="font-display text-xl text-on-surface mb-6 flex items-center gap-2 font-bold">
              <Activity className="w-6 h-6 text-primary-container" />
              Sponsorship Telemetry
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map(stat => (
                <div key={stat.id} className="bg-surface-container-high p-4 rounded-lg border border-outline-variant hover:border-primary-container/50 transition-colors">
                  <span className="font-mono text-[10px] text-on-surface-variant block mb-1 uppercase tracking-widest">{stat.label}</span>
                  <span className={`font-display text-3xl font-bold block ${stat.id === 'stat1' ? 'text-primary-container' : 'text-on-surface'}`}>
                    {stat.value}
                  </span>
                  
                  {stat.progress !== undefined && stat.progressColor && (
                    <div className="w-full bg-surface-container-highest h-1 mt-3 rounded overflow-hidden">
                      <div 
                        className={`h-full rounded ${getProgressBgColor(stat.progressColor)}`} 
                        style={{ width: `${stat.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {stat.trendText && stat.trendColor && (
                    <span className={`font-mono text-[10px] mt-2 block uppercase tracking-widest font-bold ${getTrendColor(stat.trendColor)}`}>
                      {stat.trendText}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Strategic Roadmap Stepper */}
            <div className="mt-auto">
              <h4 className="font-mono text-[10px] text-primary-container mb-3 uppercase tracking-widest font-bold">STRATEGIC ROADMAP</h4>
              <div className="flex gap-2 items-center overflow-x-auto custom-scrollbar pb-2">
                <div className="flex-1 min-w-[120px] bg-primary-container/20 border border-primary-container p-2 rounded text-center neon-glow">
                  <span className="font-mono text-[10px] text-primary-container uppercase tracking-widest font-bold">PHASE 1: OUTREACH</span>
                </div>
                <ArrowRight className="w-4 h-4 text-outline-variant shrink-0" />
                <div className="flex-1 min-w-[140px] bg-surface-container-highest border border-outline-variant p-2 rounded text-center">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">PHASE 2: NEGOTIATION</span>
                </div>
                <ArrowRight className="w-4 h-4 text-outline-variant shrink-0" />
                <div className="flex-1 min-w-[120px] bg-surface-container-highest border border-outline-variant p-2 rounded text-center opacity-50">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">PHASE 3: EXECUTION</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Operatives */}
          <div className="col-span-4 md:col-span-4 lg:col-span-6 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl text-on-surface flex items-center gap-2 font-bold">
                <Users className="w-6 h-6 text-primary-container" />
                Core Operatives
              </h3>
              <button className="text-on-surface-variant hover:text-primary-container transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {team.map(member => (
                <div key={member.id} className="flex items-center gap-4 p-2 bg-surface-container-high rounded border border-transparent hover:border-outline-variant transition-all">
                  <div className="w-10 h-10 rounded bg-surface-container-lowest border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center text-on-surface-variant font-mono text-sm">
                    {member.avatarUrl ? (
                      <Image src={member.avatarUrl} alt={member.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      member.initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-base text-on-surface font-semibold truncate">{member.name}</p>
                    <p className="font-mono text-xs text-on-surface-variant truncate">{member.role}</p>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-lowest hover:bg-primary-container/20 text-on-surface-variant hover:text-primary-container transition-colors shrink-0">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Databank */}
          <div className="col-span-4 md:col-span-4 lg:col-span-6 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all relative">
            <h3 className="font-display text-xl text-on-surface mb-2 flex items-center gap-2 font-bold">
              <ImageIcon className="w-6 h-6 text-primary-container" />
              Memory Databank
            </h3>
            <p className="font-body text-sm text-on-surface-variant mb-6">Recent E-Cell Event Archives</p>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              {archive[0] && (
                <div className="relative group rounded-lg overflow-hidden border border-outline-variant">
                  <Image 
                    src={archive[0].url} 
                    alt="Archive" 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="font-mono text-[10px] text-primary-container font-bold">{archive[0].label}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-rows-2 gap-4">
                {archive[1] && (
                  <div className="relative group rounded-lg overflow-hidden border border-outline-variant">
                    <Image 
                      src={archive[1].url} 
                      alt="Archive" 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="font-mono text-[10px] text-primary-container font-bold">{archive[1].label}</span>
                    </div>
                  </div>
                )}
                
                <div className="relative group rounded-lg overflow-hidden border border-outline-variant bg-surface-container-high flex flex-col items-center justify-center cursor-pointer hover:border-primary-container hover:bg-surface-variant transition-colors gap-2">
                  <LayoutGrid className="w-8 h-8 text-on-surface-variant group-hover:text-primary-container transition-colors" />
                  <span className="font-mono text-[10px] text-on-surface-variant group-hover:text-primary-container transition-colors uppercase tracking-widest font-bold">View All</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
