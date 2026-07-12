"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CalendarDays,
  Filter,
  Cpu,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock as ClockIcon,
  Edit2,
  Trash2,
  Plus,
  Hourglass,
  Timer
} from "lucide-react";
import { 
  getSemesterTracker,
  createSemesterClass, editSemesterClass, deleteSemesterClass
} from "@/lib/actions/study";
import { SemesterClass } from "@/lib/mock-data";
import Link from "next/link";
import SemesterClassModal from "../components/SemesterClassModal";
import ConfirmModal from "@/components/ConfirmModal";
import StudyConsistencyTracker from "@/components/study/StudyConsistencyTracker";

export default function OSStudyPage() {
  const [semester, setSemester] = useState<SemesterClass[]>([]);
  const [loading, setLoading] = useState(true);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SemesterClass | null>(null);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string; title: string }>({ isOpen: false, id: '', title: '' });

  const loadData = async () => {
    try {
      const semData = await getSemesterTracker();
      setSemester(semData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveClass = async (subject: string, instructor: string, next_due: string, next_due_label: string, status: string, notes: string, color: string) => {
    (async () => {
      try {
        if (editingClass) await editSemesterClass(editingClass.id, subject, instructor, next_due, next_due_label, status, notes, color);
        else await createSemesterClass(subject, instructor, next_due, next_due_label, status, notes, color);
      } finally { await loadData(); }
    })();
  };

  const handleDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    setSemester(semester.filter(c => c.id !== id));

    (async () => {
      try {
        await deleteSemesterClass(id);
      } finally { await loadData(); }
    })();
  };

  if (loading) return <div className="p-8">Loading Study Nexus...</div>;

  const parseDaysRemaining = (dateStr: string) => {
    if (!dateStr || dateStr.toLowerCase() === 'tbd' || dateStr.toLowerCase() === 'none') return null;
    let parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      parsed = new Date(dateStr + ", " + new Date().getFullYear());
    }
    if (isNaN(parsed.getTime())) return null;
    const diffTime = parsed.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const countdowns = semester
    .map(cls => ({ ...cls, days: parseDaysRemaining(cls.nextDue) }))
    .filter(cls => cls.days !== null && cls.days >= 0 && cls.days <= 60)
    .sort((a, b) => (a.days || 0) - (b.days || 0));

  return (
    <div className="p-8 h-full w-full overflow-y-auto animate-in fade-in duration-500 custom-scrollbar">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-display text-4xl md:text-5xl text-foreground tracking-tight mb-2 font-bold">Study_Nexus</h2>
          <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container neon-glow animate-pulse"></span>
            Active Session
          </p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Exam Countdown Widgets */}
        {countdowns.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {countdowns.map(cls => (
              <div key={`countdown-${cls.id}`} className="glass-panel p-4 rounded-theme border border-primary-container/20 min-w-[200px] flex-shrink-0 flex items-center gap-4 bg-primary-container/5 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Timer className="w-24 h-24 text-primary-container" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-variant flex flex-col items-center justify-center border border-card-border relative z-10">
                  <span className="font-display text-xl font-bold text-primary-container leading-none">{cls.days}</span>
                  <span className="font-mono text-[8px] uppercase tracking-widest text-on-surface-variant mt-1">Days</span>
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-sm text-foreground truncate max-w-[120px]">{cls.subject}</h4>
                  <p className="text-xs text-on-surface-variant truncate max-w-[120px]">{cls.nextDueLabel}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6 h-auto">
          <StudyConsistencyTracker />
        </div>

        <section className="glass-panel rounded-theme border border-card-border p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-card-border pb-4">
            <h3 className="font-display text-2xl text-foreground flex items-center gap-2 font-bold">
              <CalendarDays className="w-6 h-6 text-primary-container" />
              Current Semester Tracker
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditingClass(null); setIsClassModalOpen(true); }} className="text-on-surface-variant hover:text-primary-container transition-colors p-1">
                <Plus className="w-5 h-5" />
              </button>
              <button className="text-on-surface-variant hover:text-primary-container transition-colors p-1">
                <Filter className="w-5 h-5" />
              </button>
            </div>
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
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingClass(cls); setIsClassModalOpen(true); }} className="p-1 hover:bg-primary-container/20 text-on-surface-variant hover:text-primary-container rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmModal({ isOpen: true, id: cls.id, title: cls.subject })} className="p-1 hover:bg-error/20 text-on-surface-variant hover:text-error rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-between items-end mb-4 mt-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Active Workspaces</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/study/ml" className="glass-panel p-6 rounded-theme border border-card-border hover:border-primary-container transition-colors group cursor-pointer neon-glow-hover flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-card-border pb-4">
              <Cpu className="w-8 h-8 text-primary-container" />
              <h3 className="font-display text-2xl font-bold group-hover:text-primary-container transition-colors">Machine Learning</h3>
            </div>
            <p className="text-sm text-on-surface-variant flex-1">
              Neural networks, deep learning architectures, and data engineering pipelines. Track progress through core ML concepts and active projects.
            </p>
            <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between text-xs font-mono uppercase tracking-widest text-primary-container">
              <span>Enter Nexus</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link href="/study/dsa" className="glass-panel p-6 rounded-theme border border-card-border hover:border-primary-container transition-colors group cursor-pointer neon-glow-hover flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-card-border pb-4">
              <Database className="w-8 h-8 text-primary-container" />
              <h3 className="font-display text-2xl font-bold group-hover:text-primary-container transition-colors">Data Structures</h3>
            </div>
            <p className="text-sm text-on-surface-variant flex-1">
              Algorithmic problem solving, complexity analysis, and pattern recognition. Track daily problems and core pattern mastery.
            </p>
            <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between text-xs font-mono uppercase tracking-widest text-primary-container">
              <span>Enter Nexus</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link href="/study/web-dev" className="glass-panel p-6 rounded-theme border border-card-border hover:border-primary-container transition-colors group cursor-pointer neon-glow-hover flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-card-border pb-4">
              <Clock className="w-8 h-8 text-primary-container" />
              <h3 className="font-display text-2xl font-bold group-hover:text-primary-container transition-colors">Web Dev</h3>
            </div>
            <p className="text-sm text-on-surface-variant flex-1">
              Full-stack architectures, modern frontend frameworks, and cloud deployments. Track side projects and system design concepts.
            </p>
            <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between text-xs font-mono uppercase tracking-widest text-primary-container">
              <span>Enter Nexus</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>

      </div>

      <SemesterClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        initialData={editingClass ? { 
          subject: editingClass.subject, 
          instructor: editingClass.instructor, 
          next_due: editingClass.nextDue, 
          next_due_label: editingClass.nextDueLabel, 
          status: editingClass.status, 
          notes: editingClass.notes, 
          color: editingClass.color 
        } : undefined}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Class"
        message={`Are you sure you want to delete "${confirmModal.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />

    </div>
  );
}
