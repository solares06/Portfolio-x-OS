"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Bell,
  Clock,
  CalendarDays,
  Filter,
  Cpu,
  Database,
  Play,
  Lock,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock as ClockIcon,
  ListVideo
} from "lucide-react";
import { getSemesterTracker, getWorkspaces } from "@/lib/actions/study";
import { WorkspaceData, SemesterClass } from "@/lib/mock-data";

function WorkspaceCard({ workspace }: { workspace: WorkspaceData }) {
  const IconMap: Record<string, React.ElementType> = {
    memory: Cpu,
    data_object: Database
  };
  const Icon = IconMap[workspace.icon] || Database;

  return (
    <section className="glass-panel rounded-theme border border-card-border p-6 flex flex-col gap-4 neon-glow-hover h-[500px]">
      <div className="flex justify-between items-center border-b border-card-border pb-3">
        <h3 className="font-display text-xl text-foreground flex items-center gap-2 font-bold">
          <Icon className="w-6 h-6 text-primary-container" />
          {workspace.title}
        </h3>
        {workspace.progress !== undefined && (
          <div className="flex items-center gap-3">
            <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-container neon-glow" 
                style={{ width: `${workspace.progress}%` }} 
              />
            </div>
            <span className="font-mono text-xs text-primary-container font-bold">{workspace.progress}%</span>
          </div>
        )}
        {workspace.leetcodeCount !== undefined && (
          <div className="font-mono text-xs border border-card-border px-2 py-1 rounded bg-surface">
            LC: <span className="text-primary-container font-bold">{workspace.leetcodeCount}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column depending on workspace type */}
        {workspace.notes && (
          <div className="border border-card-border rounded bg-surface-container-low p-3 flex flex-col min-h-0">
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search notes..." 
                className="w-full bg-surface-container-lowest border-0 border-b border-card-border text-foreground focus:ring-0 focus:border-primary-container pl-8 py-1.5 font-mono text-xs transition-colors"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {workspace.notes.map(note => (
                <div key={note.id} className="p-2 border border-card-border rounded hover:border-primary-container/50 cursor-pointer transition-colors bg-surface group">
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary-container transition-colors">{note.title}</h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{note.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {workspace.tasks && (
          <div className="border border-card-border rounded bg-surface-container-low p-3 flex flex-col min-h-0">
            <h4 className="font-mono text-xs text-on-surface-variant mb-3 uppercase flex justify-between items-center pb-1 border-b border-card-border/50">
              <span>S-Sheet Progress</span>
              <span className="text-[10px]">Tree / Graph</span>
            </h4>
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs custom-scrollbar">
              {workspace.tasks.map(task => (
                <label key={task.id} className={`flex items-center gap-2 p-2 hover:bg-surface-variant rounded cursor-pointer group transition-colors ${!task.completed && task.difficulty === 'Hard' ? 'bg-surface-variant/30 border-l-2 border-primary-container' : ''}`}>
                  <input 
                    type="checkbox" 
                    defaultChecked={task.completed} 
                    className="form-checkbox bg-surface-container-lowest border-card-border text-primary-container focus:ring-primary-container rounded-sm w-4 h-4" 
                  />
                  <span className={`flex-1 transition-colors ${task.completed ? 'text-on-surface-variant line-through group-hover:text-foreground' : task.difficulty === 'Hard' ? 'text-primary-container font-bold group-hover:text-primary' : 'text-foreground group-hover:text-primary-container'}`}>
                    {task.title}
                  </span>
                  {task.difficulty === 'Hard' && (
                    <span className="font-mono text-[9px] bg-error-container/20 text-error px-1.5 py-0.5 rounded border border-error/30 uppercase">Hard</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Right Column depending on workspace type */}
        {workspace.videos && (
          <div className="border border-card-border rounded bg-surface-container-low p-3 flex flex-col min-h-0">
            <h4 className="font-mono text-xs text-on-surface-variant mb-3 uppercase flex justify-between items-center pb-1 border-b border-card-border/50">
              <span>Lecture Stream</span>
              <ListVideo className="w-4 h-4" />
            </h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {workspace.videos.map(video => (
                <div key={video.id} className={`flex gap-3 items-center p-1.5 rounded hover:bg-surface-variant cursor-pointer transition-colors group ${video.status === 'Playing' ? 'bg-surface-variant/30 border-l-2 border-primary-container' : video.status === 'Up next' ? 'opacity-60' : ''}`}>
                  <div className="relative w-20 h-12 bg-surface flex-shrink-0 rounded border border-card-border overflow-hidden flex items-center justify-center">
                    {video.thumbnailUrl ? (
                      <>
                        <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <Play className="absolute m-auto w-5 h-5 text-white drop-shadow-md z-10" fill="currentColor" />
                        {video.status === 'Playing' && (
                          <div className="absolute bottom-0 left-0 h-0.5 bg-primary-container w-[30%] neon-glow z-20" />
                        )}
                      </>
                    ) : (
                      <Lock className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${video.status === 'Watched' ? 'text-primary-container' : 'text-foreground'}`}>{video.title}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{video.duration} • {video.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {workspace.messages && (
          <div className="flex-1 border border-card-border rounded bg-surface-container-low p-3 flex flex-col min-h-0">
            <h4 className="font-mono text-xs text-on-surface-variant mb-3 uppercase flex items-center gap-2 pb-1 border-b border-card-border/50">
              <MessageSquare className="w-4 h-4" />
              <span>Logic Board</span>
            </h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {workspace.messages.map(msg => (
                <div key={msg.id} className="bg-surface border border-card-border rounded p-3 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-primary-container text-xs font-mono">{msg.user}</span>
                    <span className="text-[10px] text-on-surface-variant">{msg.timeAgo}</span>
                  </div>
                  <p className="text-foreground">{msg.content}</p>
                  {msg.reply && (
                    <div className="mt-3 text-xs text-on-surface-variant bg-surface-container-lowest p-2 rounded border border-card-border/50 border-l-secondary-container border-l-2">
                      {msg.reply}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 relative shrink-0">
              <input 
                type="text" 
                placeholder="Post a query..." 
                className="w-full bg-surface-container-lowest border border-card-border rounded text-foreground focus:ring-0 focus:border-primary-container pl-3 pr-10 py-2 font-mono text-xs transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-container hover:text-primary transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function OSStudyPage() {
  const [semester, setSemester] = useState<SemesterClass[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [semData, workData] = await Promise.all([
          getSemesterTracker(),
          getWorkspaces()
        ]);
        setSemester(semData);
        setWorkspaces(workData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8">Loading Study Nexus...</div>;

  return (
    <div className="p-8 h-full w-full overflow-y-auto animate-in fade-in duration-500 custom-scrollbar">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-card-border pb-6">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Command + K" 
            className="w-full bg-surface-container-lowest border-0 border-b border-card-border text-foreground focus:ring-0 focus:border-primary-container pl-10 py-1.5 font-mono text-sm transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant">
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Page Header Area */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight mb-2 font-bold">Study_Nexus</h2>
          <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container neon-glow animate-pulse"></span>
            Active Session
          </p>
        </div>
        <div className="flex gap-2">
          <span className="font-mono text-xs border border-primary-container/30 bg-primary-container/10 text-primary-container px-3 py-1.5 rounded uppercase font-bold">Q4 2023</span>
          <span className="font-mono text-xs border border-card-border bg-surface px-3 py-1.5 rounded text-on-surface-variant uppercase font-bold">CS Major</span>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Semester Tracker */}
        <section className="glass-panel rounded-theme border border-card-border p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-card-border pb-4">
            <h3 className="font-display text-2xl text-foreground flex items-center gap-2 font-bold">
              <CalendarDays className="w-6 h-6 text-primary-container" />
              Current Semester Tracker
            </h3>
            <button className="text-on-surface-variant hover:text-primary-container transition-colors p-1">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium w-1/4">Subject</th>
                  <th className="py-3 px-4 font-medium">Instructor</th>
                  <th className="py-3 px-4 font-medium">Next Due</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {semester.map((cls) => {
                  return (
                    <tr key={cls.id} className="border-b border-card-border/50 hover:bg-surface-variant/30 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ 
                              backgroundColor: cls.color === 'primary' ? 'var(--primary-fixed-dim)' : 
                                               cls.color === 'secondary' ? 'var(--secondary-container)' : 
                                               cls.color === 'error' ? 'var(--error-container)' : 
                                               'var(--tertiary-container)' 
                            }} 
                          />
                          <span className="font-bold text-foreground">{cls.subject}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant">{cls.instructor}</td>
                      <td className="py-4 px-4 text-foreground">
                        <span className={cls.status === 'Urgent' ? 'text-error font-medium' : ''}>{cls.nextDue}</span>
                        <span className={`text-xs ml-2 ${cls.status === 'Urgent' ? 'text-error/70' : 'text-on-surface-variant'}`}>{cls.nextDueLabel}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span 
                          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase px-2.5 py-1 rounded border"
                          style={{
                            borderColor: cls.status === 'Done' ? 'rgba(0, 242, 255, 0.3)' : 
                                         cls.status === 'Urgent' ? 'rgba(255, 180, 171, 0.3)' : 
                                         'rgba(254, 216, 58, 0.3)',
                            backgroundColor: cls.status === 'Done' ? 'rgba(0, 242, 255, 0.1)' : 
                                             cls.status === 'Urgent' ? 'rgba(255, 180, 171, 0.1)' : 
                                             'rgba(254, 216, 58, 0.1)',
                            color: cls.status === 'Done' ? 'var(--primary-container)' : 
                                   cls.status === 'Urgent' ? 'var(--error)' : 
                                   'var(--tertiary-container)'
                          }}
                        >
                          {cls.status === 'Done' ? <CheckCircle className="w-3 h-3" /> : 
                           cls.status === 'Urgent' ? <AlertTriangle className="w-3 h-3" /> : 
                           <ClockIcon className="w-3 h-3" />}
                          {cls.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant truncate max-w-[200px]">{cls.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>

      </div>
    </div>
  );
}
