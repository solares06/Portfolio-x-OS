"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Bell,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  Circle,
  Filter,
} from "lucide-react";
import { getDashboardData, createEvent, editEvent, deleteEvent } from "@/lib/actions/dashboard";
import { toggleTaskStatus, createTask, editTask, deleteTask } from "@/lib/actions/tasks";
import { TaskModal } from "./components/TaskModal";
import { EventModal } from "./components/EventModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Edit2, Trash2 } from "lucide-react";

type Task = { id: string; title: string; done: boolean; due_date: string | null };
type Event = { id: string; title: string; date: string; time: string | null };

type ConfirmModalState = { isOpen: boolean; type: 'task' | 'event'; id: string; title: string };

export default function OSDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();

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

  const refreshData = async () => {
    try {
      const data = await getDashboardData();
      setTasks(data.tasks);
      setEvents(data.events);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardData();
        setTasks(data.tasks);
        setEvents(data.events);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  const handleSaveEvent = async (title: string, date: string, time: string | null) => {
    // Optimistic UI
    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, title, date, time } : e));
    } else {
      setEvents([...events, { id: Math.random().toString(), title, date, time }]);
    }

    (async () => {
      try {
        if (editingEvent) {
          await editEvent(editingEvent.id, title, date, time);
        } else {
          await createEvent(title, date, time);
        }
      } finally {
        await refreshData();
      }
    })();
  };

  const handleDelete = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    // Optimistic UI
    if (type === 'task') {
      setTasks(tasks.filter(t => t.id !== id));
    } else {
      setEvents(events.filter(e => e.id !== id));
    }

    (async () => {
      try {
        if (type === 'task') {
          await deleteTask(id);
        } else {
          await deleteEvent(id);
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

  // Calendar setup (mock 31 days)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const currentDateStr = now.toISOString().split('T')[0];
  const currentDay = now.getDate();

  return (
    <div className="p-8 overflow-y-auto h-full w-full space-y-6 animate-in fade-in duration-500">
      {/* Top Bar */}
      <header className="flex items-center justify-between bg-card border border-card-border rounded-theme p-4 glass-panel">
        <div className="flex items-center space-x-4">
          <div className="font-mono text-xl font-bold tracking-widest text-primary-container">
            Core_OS
          </div>
        </div>
        <div className="flex items-center space-x-6 text-on-surface-variant">
          <div className="flex items-center space-x-2 font-mono text-sm">
            <Clock className="w-4 h-4" />
            <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button className="hover:text-primary transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-container rounded-full animate-pulse"></span>
          </button>
          <div className="w-8 h-8 rounded-sm bg-surface-bright border border-card-border overflow-hidden">
            <Image src="https://picsum.photos/seed/user/100/100" alt="Avatar" width={100} height={100} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Calendar */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-card border border-card-border rounded-theme p-6 glass-panel neon-glow-hover">
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="font-display text-xl font-bold">{currentMonth}</h2>
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-sm">
                    SYS.CALENDAR SYNCED
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:text-primary transition-colors text-on-surface-variant"><ChevronLeft className="w-5 h-5" /></button>
                  <button className="p-1 hover:text-primary transition-colors text-on-surface-variant"><ChevronRight className="w-5 h-5" /></button>
                  <button 
                    onClick={() => { setEditingEvent(null); setSelectedDate(null); setIsEventModalOpen(true); }}
                    className="ml-2 flex items-center space-x-1 font-mono text-xs uppercase bg-surface-container border border-card-border px-3 py-1.5 rounded hover:border-primary-container hover:text-primary-container transition-colors"
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
                {daysInMonth.map(day => {
                  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = events.filter(e => e.date === dateStr);
                  const isToday = day === currentDay;

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
                      <div className={`font-mono text-sm ${isToday ? 'text-primary-container' : 'text-on-surface-variant'}`}>{day}</div>
                      <div className="mt-2 space-y-1">
                        {dayEvents.map(e => (
                          <div 
                            key={e.id} 
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setEditingEvent(e);
                              setIsEventModalOpen(true);
                            }}
                            className="text-[10px] font-mono truncate px-1 rounded-sm bg-primary-container/20 text-primary-container cursor-pointer hover:bg-primary-container hover:text-on-primary-container transition-colors"
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

            {/* Active Protocols (Tasks) */}
            <section className="bg-card border border-card-border rounded-theme p-6 glass-panel neon-glow-hover">
              <header className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h2 className="font-display text-xl font-bold">Active Protocols</h2>
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
                  <button className="flex items-center space-x-1 font-mono text-xs text-on-surface-variant hover:text-primary transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </header>
              
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-on-surface-variant font-mono text-sm text-center py-4">No active protocols</div>
                ) : tasks.map(task => (
                  <div key={task.id} className={`flex items-start space-x-4 p-4 rounded-theme border transition-all ${task.done ? 'bg-surface-container-lowest border-transparent opacity-50' : 'bg-surface-container border-card-border hover:border-outline-variant'}`}>
                    <button onClick={() => toggleTask(task.id, task.done)} className="mt-1 flex-shrink-0 text-on-surface-variant hover:text-primary transition-colors">
                      {task.done ? <CheckCircle className="w-5 h-5 text-primary-container" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 space-y-2 group">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-bold ${task.done ? 'line-through text-on-surface-variant' : 'text-foreground'}`}>{task.title}</h3>
                        <div className="flex items-center space-x-2">
                          <div className="hidden group-hover:flex space-x-2 mr-2">
                            <button onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }} className="text-on-surface-variant hover:text-primary-container">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmModal({ isOpen: true, type: 'task', id: task.id, title: task.title })} className="text-on-surface-variant hover:text-error">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-mono text-[10px] text-on-surface-variant">DUE: {task.due_date || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Timeline */}
          <div className="space-y-6">
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
                {events.filter(e => e.date === currentDateStr).length === 0 ? (
                  <div className="text-on-surface-variant font-mono text-sm">No events scheduled for today.</div>
                ) : events.filter(e => e.date === currentDateStr).map((entry) => {
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
                          <span className={`font-mono text-xs ${isPast ? 'text-on-surface-variant line-through' : 'text-primary-container'}`}>
                            {entry.time || 'All Day'}
                          </span>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingEvent(entry); setIsEventModalOpen(true); }} className="text-on-surface-variant hover:text-primary-container">
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
        </div>
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
