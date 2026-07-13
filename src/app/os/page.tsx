"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  Circle,
  Filter,
  Activity,
  Dumbbell,
  BookOpen,
  Target,
  Image as ImageIcon,
  Camera
} from "lucide-react";
import { getDashboardData, createEvent, editEvent, deleteEvent, getTodaySummary, getWeeklyReview, getOsProfile, updateOsProfile, getVisionBoardImages, uploadVisionBoardImage, deleteVisionBoardImage } from "@/lib/actions/dashboard";
import { toggleTaskStatus, createTask, editTask, deleteTask } from "@/lib/actions/tasks";
import { uploadPortfolioImage } from "@/lib/actions/portfolio";
import { TaskModal } from "./components/TaskModal";
import { EventModal } from "./components/EventModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Edit2, Trash2 } from "lucide-react";

type Task = { id: string; title: string; done: boolean; due_date: string | null };
type Event = { id: string; title: string; date: string; time: string | null };
type VisionImage = { id: string; image_url: string };

type ConfirmModalState = { isOpen: boolean; type: 'task' | 'event' | 'vision'; id: string; title: string; url?: string };

export default function OSDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [weeklyReview, setWeeklyReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [visionBoard, setVisionBoard] = useState<VisionImage[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>("/avatar.jpg");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingVision, setUploadingVision] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const visionInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: 'task',
    id: '',
    title: ''
  });

  const [viewDate, setViewDate] = useState(() => new Date());
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed'>('all');
  const istTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const now = new Date(istTimeStr);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = new Date(viewYear, viewMonth, 1).getDay();
  const currentMonthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const currentHour = now.getHours();
  let greeting = 'Morning';
  if (currentHour < 5 || currentHour >= 17) {
    greeting = 'Evening';
  } else if (currentHour < 12) {
    greeting = 'Morning';
  } else {
    greeting = 'Afternoon';
  }

  const refreshData = async (forDate?: Date) => {
    const d = forDate ?? viewDate;
    try {
      const data = await getDashboardData(d.getFullYear(), d.getMonth());
      setTasks(data.tasks);
      setEvents(data.events);

      const clientDayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const summary = await getTodaySummary(clientDayName);
      setTodaySummary(summary);

      if (now.getDay() === 0) { // Sunday
        const review = await getWeeklyReview();
        setWeeklyReview(review);
      }

      const profile = await getOsProfile();
      if (profile && profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }

      const visionImages = await getVisionBoardImages();
      setVisionBoard(visionImages);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        await refreshData(viewDate);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [viewDate]);

  const changeMonth = (delta: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleSaveTask = async (title: string, dueDate: string | null) => {
    // Optimistic UI
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, title, due_date: dueDate } : t));
    } else {
      setTasks([{ id: Math.random().toString(), title, done: false, due_date: dueDate }, ...tasks]);
    }

    (async () => {
      try {
        if (editingTask) {
          await editTask(editingTask.id, title, dueDate);
        } else {
          await createTask(title, dueDate);
        }
      } finally {
        await refreshData();
      }
    })();
  };

  const handleSaveEvent = async (title: string, date: string, time: string | null, recurrence_rule: string | null) => {
    // Optimistic UI
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, title, date, time } : e));
    } else {
      setEvents([...events, { id: Math.random().toString(), title, date, time }]);
    }

    (async () => {
      try {
        if (editingEvent) {
          await editEvent(editingEvent.id, title, date, time, recurrence_rule);
        } else {
          await createEvent(title, date, time, recurrence_rule);
        }
      } finally {
        await refreshData();
      }
    })();
  };

  const handleDelete = async () => {
    const { type, id, url } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    // Optimistic UI
    if (type === 'task') {
      setTasks(tasks.filter(t => t.id !== id));
    } else if (type === 'event') {
      setEvents(events.filter(e => e.id !== id));
    } else if (type === 'vision') {
      setVisionBoard(visionBoard.filter(v => v.id !== id));
    }

    (async () => {
      try {
        if (type === 'task') {
          await deleteTask(id);
        } else if (type === 'event') {
          await deleteEvent(id);
        } else if (type === 'vision' && url) {
          await deleteVisionBoardImage(id, url);
        }
      } finally {
        await refreshData();
      }
    })();
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    try {
      await toggleTaskStatus(id, !currentStatus);
    } catch (e) {
      console.error(e);
      // Revert on error
      setTasks(tasks.map(t => t.id === id ? { ...t, done: currentStatus } : t));
    }
  };

  // Calendar setup
  const currentDay = now.getDate();
  const isViewingCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const cycleFilter = () => {
    if (taskFilter === 'all') setTaskFilter('active');
    else if (taskFilter === 'active') setTaskFilter('completed');
    else setTaskFilter('all');
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'active') return !t.done;
    if (taskFilter === 'completed') return t.done;
    return true;
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadPortfolioImage(formData);
      await updateOsProfile(url);
      setAvatarUrl(url);
    } catch (e) {
      console.error(e);
      alert("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleVisionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (visionBoard.length >= 30) {
      alert("Vision board is full! Maximum 30 images allowed.");
      return;
    }
    setUploadingVision(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadVisionBoardImage(formData);
      await refreshData();
    } catch (e) {
      console.error(e);
      alert("Failed to upload vision board image");
    } finally {
      setUploadingVision(false);
      if (visionInputRef.current) visionInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8 overflow-y-auto h-full w-full space-y-6 animate-in fade-in duration-500">
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Dashboard Header & Summary Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-6 mb-2">
                <div 
                  className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-primary-container/50 shadow-[0_0_15px_rgba(0,242,255,0.2)] overflow-hidden relative cursor-pointer group flex items-center justify-center shrink-0"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-on-surface-variant w-5 h-5" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-5 h-5" />
                  </div>
                  <input 
                    type="file" 
                    ref={avatarInputRef} 
                    onChange={handleAvatarUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <div>
                  <h1 className="font-display text-4xl font-bold text-on-surface">
                    Good {greeting}.
                  </h1>
                </div>
              </div>
              <p className="text-on-surface-variant font-mono text-sm">
                Today is {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
              </p>
            </div>

            {/* Dynamic Panel: Weekly Review (Sunday) OR Today Summary (Other days) */}
            {now.getDay() === 0 && weeklyReview ? (
              <div className="bg-secondary-container/10 border border-secondary-container/30 rounded-xl p-5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-secondary text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Weekly Review
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant font-mono">Tasks Completed</span>
                    <span className="font-bold text-on-surface">{weeklyReview.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant font-mono">Gym Days Logged</span>
                    <span className="font-bold text-on-surface">{weeklyReview.gymDays} / 4</span>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/30 text-xs text-secondary font-mono text-center">
                    {weeklyReview.tasksCompleted > 10 ? "Great week! Time to recharge." : "Steady progress. Let's plan for next week."}
                  </div>
                </div>
              </div>
            ) : todaySummary ? (
              <div className="bg-primary-container/10 border border-primary-container/30 rounded-xl p-5 shadow-lg backdrop-blur-sm">
                <h3 className="font-display font-bold text-primary mb-4 text-lg">Today's Focus</h3>
                <div className="space-y-4">
                  {todaySummary.gymWorkout && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-container/20 rounded text-primary"><Dumbbell className="w-4 h-4" /></div>
                      <div>
                        <div className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">Gym</div>
                        <div className="text-sm font-bold text-on-surface">{todaySummary.gymWorkout}</div>
                      </div>
                    </div>
                  )}
                  {todaySummary.nextClass && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary-container/20 rounded text-secondary"><BookOpen className="w-4 h-4" /></div>
                      <div>
                        <div className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">Next Class</div>
                        <div className="text-sm font-bold text-on-surface">{todaySummary.nextClass.code} - {todaySummary.nextClass.title}</div>
                      </div>
                    </div>
                  )}
                  {todaySummary.openTasks.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-tertiary-container/20 rounded text-tertiary"><Target className="w-4 h-4" /></div>
                      <div>
                        <div className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">Top Task</div>
                        <div className="text-sm font-bold text-on-surface truncate w-40">{todaySummary.openTasks[0].title}</div>
                      </div>
                    </div>
                  )}
                  {!todaySummary.gymWorkout && !todaySummary.nextClass && todaySummary.openTasks.length === 0 && (
                    <div className="text-on-surface-variant font-mono text-sm py-2">
                      Clear schedule! Take a breath or plan ahead.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Calendar */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-card border border-card-border rounded-theme p-6 glass-panel neon-glow-hover">
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="font-display text-xl font-bold">{currentMonthLabel}</h2>
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-sm">
                    SYS.CALENDAR SYNCED
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => changeMonth(-1)} className="p-1 hover:text-primary transition-colors text-on-surface-variant"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => changeMonth(1)} className="p-1 hover:text-primary transition-colors text-on-surface-variant"><ChevronRight className="w-5 h-5" /></button>
                  <button 
                    onClick={() => { setEditingEvent(null); setSelectedDate(null); setIsEventModalOpen(true); }}
                    className="ml-2 flex items-center space-x-1 font-mono text-xs uppercase bg-surface-container border border-card-border px-3 py-1.5 rounded hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Event</span>
                  </button>
                </div>
              </header>
              
              {/* Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="text-center font-mono text-xs text-on-surface-variant pb-2 border-b border-card-border">
                    {day}
                  </div>
                ))}
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`pad-${i}`} className="min-h-[80px]" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = events.filter(e => e.date === dateStr);
                  const isToday = isViewingCurrentMonth && day === currentDay;

                  return (
                    <div 
                      key={day} 
                      onClick={() => {
                        setEditingEvent(null);
                        setSelectedDate(dateStr);
                        setIsEventModalOpen(true);
                      }}
                      className={`min-h-[80px] p-2 border border-card-border rounded bg-surface-container-lowest transition-colors cursor-pointer ${isToday ? 'border-primary-container neon-glow' : 'hover:border-outline-variant'}`}
                    >
                      <div className={`font-mono text-sm ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>{day}</div>
                      <div className="mt-2 space-y-1">
                        {dayEvents.map(e => (
                          <div 
                            key={e.id} 
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setEditingEvent(e);
                              setIsEventModalOpen(true);
                            }}
                            className="text-[10px] font-mono truncate px-1 rounded-sm bg-primary-container/20 text-primary cursor-pointer hover:bg-primary hover:text-on-primary transition-colors"
                          >
                            {e.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            
          {/* Timeline (Moved to left column) */}
            <section className="bg-card border border-card-border rounded-theme p-6 glass-panel neon-glow-hover sticky top-6">
              <header className="flex items-center justify-between mb-8 pb-4 border-b border-card-border">
                <div>
                  <h2 className="font-display text-xl font-bold">Timeline</h2>
                  <p className="font-mono text-xs text-on-surface-variant mt-1">{now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-sm">
                  SYNCED
                </span>
              </header>

              <div className="relative border-l-2 border-surface-border pl-6 space-y-8">
                {events.filter(e => e.date === todayStr).length === 0 ? (
                  <div className="text-on-surface-variant font-mono text-sm">No events scheduled for today.</div>
                ) : events.filter(e => e.date === todayStr).map((entry) => {
                  const isPast = entry.time && new Date(`${entry.date}T${entry.time}`) < now;
                  
                  return (
                    <div key={entry.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 bg-background ${
                        isPast ? 'border-primary-container bg-primary-container' : 'border-outline-variant shadow-[0_0_8px_rgba(0,242,255,0.8)]'
                      }`} />
                      
                      <div className={`p-3 rounded border transition-all group ${
                        !isPast ? 'bg-surface-container border-primary-container neon-glow' :
                        'bg-surface-container-lowest border-transparent'
                      }`}>
                        <div className="flex items-center justify-between mb-1 group-hover:opacity-100">
                          <span className={`font-mono text-xs ${isPast ? 'text-on-surface-variant line-through' : 'text-primary'}`}>
                            {entry.time || 'All Day'}
                          </span>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingEvent(entry); setIsEventModalOpen(true); }} className="text-on-surface-variant hover:text-primary">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => setConfirmModal({ isOpen: true, type: 'event', id: entry.id, title: entry.title })} className="text-on-surface-variant hover:text-error">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <h4 className={`font-bold text-sm ${isPast ? 'text-on-surface-variant line-through' : 'text-foreground'}`}>
                          {entry.title}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: To Do (Tasks) */}
          <div className="space-y-6">
            {/* To Do (Tasks) */}
            <section className="bg-card border border-card-border rounded-theme p-6 glass-panel neon-glow-hover">
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h2 className="font-display text-xl font-bold">To Do</h2>
                  <span className="font-mono text-[10px] bg-primary-container text-on-primary-container px-2 py-0.5 rounded-sm">
                    {tasks.filter(t => !t.done).length} PENDING
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                    className="flex items-center space-x-1 font-mono text-xs text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                  <button onClick={cycleFilter} className="flex items-center space-x-1 font-mono text-xs text-on-surface-variant hover:text-primary transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>{taskFilter.toUpperCase()}</span>
                  </button>
                </div>
              </header>
              
              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="text-on-surface-variant font-mono text-sm text-center py-4">No active protocols</div>
                ) : filteredTasks.map(task => (
                  <div key={task.id} className={`flex items-start space-x-4 p-4 rounded-theme border transition-all ${task.done ? 'bg-surface-container-lowest border-transparent opacity-50' : 'bg-surface-container border-card-border hover:border-outline-variant'}`}>
                    <button onClick={() => toggleTask(task.id, task.done)} className="mt-1 flex-shrink-0 text-on-surface-variant hover:text-primary transition-colors">
                      {task.done ? <CheckCircle className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 space-y-2 group">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-bold ${task.done ? 'line-through text-on-surface-variant' : 'text-foreground'}`}>{task.title}</h3>
                        <div className="flex items-center space-x-2">
                          <div className="hidden group-hover:flex space-x-2 mr-2">
                            <button onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }} className="text-on-surface-variant hover:text-primary">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={async () => {
                                if (task.done) {
                                  // Optimistic delete without warning
                                  setTasks(prev => prev.filter(t => t.id !== task.id));
                                  try {
                                    await deleteTask(task.id);
                                  } catch (e) {
                                    console.error("Failed to delete task:", e);
                                    refreshData(); // Revert on failure
                                  }
                                } else {
                                  setConfirmModal({ isOpen: true, type: 'task', id: task.id, title: task.title });
                                }
                              }} 
                              className="text-on-surface-variant hover:text-error"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-mono text-[10px] text-on-surface-variant">TIME: {task.due_date || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          </div>

          {/* Vision Board */}
          <div className="bg-card border border-card-border rounded-theme p-6 glass-panel neon-glow-hover mt-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold">Vision Board</h2>
              <button 
                onClick={() => visionInputRef.current?.click()}
                disabled={uploadingVision}
                className="bg-surface-container text-primary hover:bg-surface-container-high px-4 py-2 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4" />
                {uploadingVision ? 'Uploading...' : 'Add Photo'}
              </button>
              <input 
                type="file" 
                ref={visionInputRef} 
                onChange={handleVisionUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {visionBoard.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-outline-variant/50 rounded-theme">
                <ImageIcon className="w-12 h-12 text-on-surface-variant/50 mx-auto mb-3" />
                <p className="text-on-surface-variant font-mono text-sm">Your vision board is empty.</p>
                <p className="text-xs text-on-surface-variant/70 mt-1">Upload some photos that inspire you!</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="masonry-grid">
                  {visionBoard.map((img) => (
                    <div key={img.id} className="masonry-item relative group rounded-theme overflow-hidden border border-card-border">
                      <img src={img.image_url} alt="Vision Board" className="w-full h-auto object-cover" loading="lazy" />
                      <button 
                        onClick={() => setConfirmModal({ isOpen: true, type: 'vision', id: img.id, title: 'this image', url: img.image_url })}
                        className="absolute top-3 right-3 bg-background/80 backdrop-blur text-error p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-background transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleSaveTask}
        initialData={editingTask ? { title: editingTask.title, dueDate: editingTask.due_date } : undefined}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? () => {
          setIsEventModalOpen(false);
          setConfirmModal({ isOpen: true, type: 'event', id: editingEvent.id, title: editingEvent.title });
        } : undefined}
        initialData={editingEvent ? { title: editingEvent.title, date: editingEvent.date, time: editingEvent.time } : selectedDate ? { title: "", date: selectedDate, time: null } : undefined}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleDelete}
        title={`Delete ${confirmModal.type === 'task' ? 'Protocol' : 'Event'}`}
        message={`Are you sure you want to delete "${confirmModal.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
