"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
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
  Timer,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FlaskConical,
  Briefcase,
  Award,
  Calendar,
  Check,
  X
} from "lucide-react";
import { 
  getSemesterTracker,
  createSemesterClass, editSemesterClass, deleteSemesterClass,
  getAllDeadlines, createDeadline, toggleDeadline, deleteDeadline,
  getAllClassTests, upsertClassTest
} from "@/lib/actions/study";
import { SemesterClass, Deadline, ClassTest, SubjectType } from "@/lib/mock-data";
import Link from "next/link";
import SemesterClassModal from "../components/SemesterClassModal";
import ConfirmModal from "@/components/ConfirmModal";
import StudyConsistencyTracker from "@/components/study/StudyConsistencyTracker";
import WeeklyGoalBoard from "@/components/study/WeeklyGoalBoard";

const TYPE_CONFIG: Record<SubjectType, { label: string; icon: React.ReactNode; dotColor: string; bgAccentClass: string; textClass: string }> = {
  theory: { label: 'Theory', icon: <BookOpen className="w-3.5 h-3.5" />, dotColor: 'var(--primary-color)', bgAccentClass: 'bg-[#0ea5e9]/10 dark:bg-[#00f2ff]/10', textClass: 'text-primary' },
  lab: { label: 'Lab', icon: <FlaskConical className="w-3.5 h-3.5" />, dotColor: 'var(--secondary)', bgAccentClass: 'bg-[#6366f1]/10 dark:bg-[#d1bcff]/10', textClass: 'text-secondary' },
  minor_project: { label: 'Minor Project', icon: <Briefcase className="w-3.5 h-3.5" />, dotColor: '#eab308', bgAccentClass: 'bg-[#eab308]/10', textClass: 'text-[#eab308]' },
  major_project: { label: 'Major Project', icon: <Award className="w-3.5 h-3.5" />, dotColor: '#ec4899', bgAccentClass: 'bg-[#ec4899]/10', textClass: 'text-[#ec4899]' },
};

export default function OSStudyPage() {
  const pathname = usePathname();
  const prefix = pathname.startsWith("/os") ? "/os" : "";

  const [semester, setSemester] = useState<SemesterClass[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [classTests, setClassTests] = useState<ClassTest[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [newDeadlineTitle, setNewDeadlineTitle] = useState("");
  const [newDeadlineDate, setNewDeadlineDate] = useState("");

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SemesterClass | null>(null);

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string; title: string }>({ isOpen: false, id: '', title: '' });

  // CT inline editing
  const [editingCT, setEditingCT] = useState<{ classId: string; ctNum: number } | null>(null);
  const [ctDate, setCtDate] = useState("");
  const [ctMarks, setCtMarks] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [semData, dlData, ctData] = await Promise.all([
        getSemesterTracker(),
        getAllDeadlines(),
        getAllClassTests()
      ]);
      setSemester(semData);
      setDeadlines(dlData);
      setClassTests(ctData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveClass = async (subject: string, instructor: string, next_due: string, next_due_label: string, status: string, notes: string, color: string, type: SubjectType) => {
    try {
      if (editingClass) await editSemesterClass(editingClass.id, subject, instructor, next_due, next_due_label, status, notes, color, type);
      else await createSemesterClass(subject, instructor, next_due, next_due_label, status, notes, color, type);
    } finally { await loadData(); }
  };

  const handleDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });
    setSemester(semester.filter(c => c.id !== id));
    try {
      await deleteSemesterClass(id);
    } finally { await loadData(); }
  };

  const handleAddDeadline = async (classId: string) => {
    if (!newDeadlineTitle.trim()) return;
    try {
      await createDeadline(classId, newDeadlineTitle, newDeadlineDate || null);
      setNewDeadlineTitle("");
      setNewDeadlineDate("");
    } finally { await loadData(); }
  };

  const handleToggleDeadline = async (dl: Deadline) => {
    try {
      await toggleDeadline(dl.id, !dl.isCompleted);
    } finally { await loadData(); }
  };

  const handleDeleteDeadline = async (id: string) => {
    try {
      await deleteDeadline(id);
    } finally { await loadData(); }
  };

  const handleSaveCT = async (classId: string, ctNum: number, subjectName: string) => {
    try {
      await upsertClassTest(
        classId,
        ctNum,
        ctDate || null,
        30,
        ctMarks ? parseInt(ctMarks) : null,
        subjectName
      );
      setEditingCT(null);
      setCtDate("");
      setCtMarks("");
    } finally { await loadData(); }
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

  const getDeadlinesForSubject = (classId: string) => deadlines.filter(d => d.classId === classId);
  const getClassTestsForSubject = (classId: string) => classTests.filter(ct => ct.classId === classId);

  const renderCTChip = (ct: ClassTest) => {
    if (ct.marksObtained !== null) {
      const pct = ct.marksObtained / ct.maxMarks;
      const chipColor = pct >= 0.8 ? 'rgba(0, 242, 255, 0.2)' : pct >= 0.6 ? 'rgba(254, 216, 58, 0.2)' : 'rgba(255, 180, 171, 0.2)';
      const textColor = pct >= 0.8 ? 'var(--primary-container)' : pct >= 0.6 ? 'var(--tertiary-container)' : 'var(--error)';
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border" style={{ backgroundColor: chipColor, borderColor: chipColor, color: textColor }}>
          CT{ct.ctNumber}: {ct.marksObtained}/{ct.maxMarks}
        </span>
      );
    }
    if (ct.date) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-outline text-on-surface">
          <Calendar className="w-2.5 h-2.5" />
          CT{ct.ctNumber}: {new Date(ct.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-dashed border-outline text-on-surface-variant">
        CT{ct.ctNumber}: TBD
      </span>
    );
  };

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

      {/* ── Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

        {/* ── LEFT: Semester Tracker ── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Exam Countdown Widgets */}
          {countdowns.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {countdowns.map(cls => (
                <div key={`countdown-${cls.id}`} className="glass-panel p-4 rounded-theme border border-primary-container/20 min-w-[200px] flex-shrink-0 flex items-center gap-4 bg-primary-container/5 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Timer className="w-24 h-24 text-primary" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-surface-variant flex flex-col items-center justify-center border border-card-border relative z-10">
                    <span className="font-display text-xl font-bold text-primary leading-none">{cls.days}</span>
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

          {/* Semester Tracker Table */}
          <section className="glass-panel rounded-theme border border-card-border p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-card-border pb-4">
              <h3 className="font-display text-2xl text-foreground flex items-center gap-2 font-bold">
                <CalendarDays className="w-6 h-6 text-primary" />
                Current Semester Tracker
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingClass(null); setIsClassModalOpen(true); }} className="text-on-surface-variant hover:text-primary transition-colors p-1">
                  <Plus className="w-5 h-5" />
                </button>
                <button className="text-on-surface-variant hover:text-primary transition-colors p-1">
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
                    <th className="py-3 px-4 font-medium">Class Tests</th>
                    <th className="py-3 px-4 font-medium">Deadlines</th>
                    <th className="py-3 px-4 font-medium w-16"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {semester.map((cls) => {
                    const typeConf = TYPE_CONFIG[cls.type || 'theory'];
                    const subjectDeadlines = getDeadlinesForSubject(cls.id);
                    const subjectCTs = getClassTestsForSubject(cls.id);
                    const isExpanded = expandedRow === cls.id;
                    const pendingDeadlines = subjectDeadlines.filter(d => !d.isCompleted).length;

                    return (
                      <React.Fragment key={cls.id}>
                        <tr 
                          className={`border-b border-card-border/50 hover:brightness-95 dark:hover:brightness-110 transition-colors group cursor-pointer ${typeConf.bgAccentClass}`}
                          onClick={() => setExpandedRow(isExpanded ? null : cls.id)}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeConf.dotColor }} />
                              <div>
                                <span className="font-bold text-foreground">{cls.subject}</span>
                                <div className={`flex items-center gap-1 mt-0.5 text-[10px] font-mono uppercase tracking-wider ${typeConf.textClass}`}>
                                  {typeConf.icon}
                                  {typeConf.label}
                                </div>
                              </div>
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant ml-auto" /> : <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-on-surface-variant">{cls.instructor}</td>
                          <td className="py-4 px-4">
                            {cls.type === 'theory' ? (
                              <div className="flex flex-wrap gap-1">
                                {[1, 2].map(ctNum => {
                                  const ct = subjectCTs.find(c => c.ctNumber === ctNum);
                                  return ct ? (
                                    <button key={ctNum} onClick={(e) => { e.stopPropagation(); setExpandedRow(cls.id); setEditingCT({ classId: cls.id, ctNum }); setCtDate(ct.date || ''); setCtMarks(ct.marksObtained !== null ? String(ct.marksObtained) : ''); }}>
                                      {renderCTChip(ct)}
                                    </button>
                                  ) : (
                                    <button key={ctNum} onClick={(e) => { e.stopPropagation(); setExpandedRow(cls.id); setEditingCT({ classId: cls.id, ctNum }); setCtDate(''); setCtMarks(''); }}
                                      className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-dashed border-outline text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
                                      <Plus className="w-2.5 h-2.5" /> CT{ctNum}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-on-surface-variant">N/A</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {pendingDeadlines > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/30">
                                {pendingDeadlines} pending
                              </span>
                            ) : subjectDeadlines.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-primary-container/10 text-primary-container border border-primary-container/20">
                                <Check className="w-2.5 h-2.5" /> All done
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-on-surface-variant">None</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); setEditingClass(cls); setIsClassModalOpen(true); }} className="p-1 hover:bg-primary-container/20 text-on-surface-variant hover:text-primary rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: cls.id, title: cls.subject }); }} className="p-1 hover:bg-error/20 text-on-surface-variant hover:text-error rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row: Deadlines + CT editing */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className={`px-4 pb-4 pt-0 ${typeConf.bgAccentClass}`}>
                              <div className="border border-card-border/50 rounded-lg p-4 mt-0 space-y-4 bg-surface-container-lowest/50">
                                
                                {/* Deadlines Section */}
                                <div>
                                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
                                    <CalendarDays className="w-3.5 h-3.5" /> Deadlines & Tasks
                                  </h4>
                                  
                                  {subjectDeadlines.length > 0 && (
                                    <div className="space-y-1.5 mb-3">
                                      {subjectDeadlines.map(dl => (
                                        <div key={dl.id} className="flex items-center gap-3 group/dl">
                                          <button onClick={() => handleToggleDeadline(dl)} className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${dl.isCompleted ? 'bg-primary-container border-primary-container' : 'border-outline-variant hover:border-primary'}`}>
                                            {dl.isCompleted && <Check className="w-2.5 h-2.5 text-on-primary-container" />}
                                          </button>
                                          <span className={`text-sm flex-1 ${dl.isCompleted ? 'line-through text-outline' : 'text-on-surface'}`}>{dl.title}</span>
                                          {dl.dueDate && (
                                            <span className="text-[10px] font-mono text-on-surface-variant">
                                              {new Date(dl.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                          )}
                                          <button onClick={() => handleDeleteDeadline(dl.id)} className="opacity-0 group-hover/dl:opacity-100 p-0.5 hover:text-error transition-all text-on-surface-variant">
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Add deadline inline */}
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={newDeadlineTitle}
                                      onChange={e => setNewDeadlineTitle(e.target.value)}
                                      placeholder="Add a deadline or task..."
                                      className="flex-1 bg-transparent border-b border-outline-variant/50 text-sm text-on-surface py-1 px-0 focus:border-primary outline-none transition-colors placeholder:text-outline"
                                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDeadline(cls.id); } }}
                                    />
                                    <input
                                      type="date"
                                      value={newDeadlineDate}
                                      onChange={e => setNewDeadlineDate(e.target.value)}
                                      className="bg-transparent border-b border-outline-variant/50 text-[11px] font-mono text-on-surface-variant py-1 px-0 focus:border-primary outline-none transition-colors w-32"
                                    />
                                    <button onClick={() => handleAddDeadline(cls.id)} className="p-1 text-primary hover:bg-primary-container/20 rounded transition-colors">
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* CT Editing (Theory only) */}
                                {cls.type === 'theory' && (
                                  <div>
                                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
                                      <Award className="w-3.5 h-3.5" /> Class Tests
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                      {[1, 2].map(ctNum => {
                                        const ct = subjectCTs.find(c => c.ctNumber === ctNum);
                                        const isEditing = editingCT?.classId === cls.id && editingCT?.ctNum === ctNum;
                                        
                                        return (
                                          <div key={ctNum} className="border border-card-border rounded-lg p-3 space-y-2 bg-surface-container-lowest">
                                            <div className="flex items-center justify-between">
                                              <span className="font-mono text-xs font-bold text-on-surface">CT{ctNum}</span>
                                              <span className="font-mono text-[10px] text-outline">{ct?.maxMarks || 30} marks</span>
                                            </div>
                                            {isEditing ? (
                                              <div className="space-y-2">
                                                <input type="date" value={ctDate} onChange={e => setCtDate(e.target.value)} className="w-full bg-transparent border border-outline-variant rounded p-1.5 text-xs text-on-surface focus:border-primary outline-none" />
                                                <input type="number" min="0" max={ct?.maxMarks || 30} value={ctMarks} onChange={e => setCtMarks(e.target.value)} placeholder="Marks (leave empty if not yet)" className="w-full bg-transparent border border-outline-variant rounded p-1.5 text-xs text-on-surface focus:border-primary outline-none placeholder:text-outline" />
                                                <div className="flex gap-1.5">
                                                  <button onClick={() => handleSaveCT(cls.id, ctNum, cls.subject)} className="flex-1 bg-primary-container text-on-primary-container text-[10px] font-mono uppercase py-1 rounded hover:brightness-110 transition-all">Save</button>
                                                  <button onClick={() => setEditingCT(null)} className="px-2 text-[10px] font-mono uppercase text-on-surface-variant hover:text-on-surface transition-colors">Cancel</button>
                                                </div>
                                              </div>
                                            ) : (
                                              <button onClick={() => { setEditingCT({ classId: cls.id, ctNum }); setCtDate(ct?.date || ''); setCtMarks(ct?.marksObtained !== null && ct?.marksObtained !== undefined ? String(ct.marksObtained) : ''); }}
                                                className="w-full text-left">
                                                {ct ? renderCTChip(ct) : <span className="text-[10px] font-mono text-outline hover:text-primary transition-colors">+ Set date & marks</span>}
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* ── RIGHT: Weekly Goals + Consistency Tracker (Sidebar) ── */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 lg:self-start space-y-6">
          <WeeklyGoalBoard />
          <StudyConsistencyTracker />
        </div>
      </div>

      {/* Active Workspaces */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">Active Workspaces</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href={`${prefix}/study/ml`} className="glass-panel p-6 rounded-theme border border-card-border hover:border-primary-container transition-colors group cursor-pointer neon-glow-hover flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-card-border pb-4">
                <Cpu className="w-8 h-8 text-primary" />
                <h3 className="font-display text-2xl font-bold group-hover:text-primary transition-colors">Machine Learning</h3>
              </div>
              <p className="text-sm text-on-surface-variant flex-1">
                Neural networks, deep learning architectures, and data engineering pipelines. Track progress through core ML concepts and active projects.
              </p>
              <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between text-xs font-mono uppercase tracking-widest text-primary">
                <span>Enter Nexus</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            <Link href={`${prefix}/study/dsa`} className="glass-panel p-6 rounded-theme border border-card-border hover:border-primary-container transition-colors group cursor-pointer neon-glow-hover flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-card-border pb-4">
                <Database className="w-8 h-8 text-primary" />
                <h3 className="font-display text-2xl font-bold group-hover:text-primary transition-colors">Data Structures</h3>
              </div>
              <p className="text-sm text-on-surface-variant flex-1">
                Algorithmic problem solving, complexity analysis, and pattern recognition. Track daily problems and core pattern mastery.
              </p>
              <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between text-xs font-mono uppercase tracking-widest text-primary">
                <span>Enter Nexus</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            <Link href={`${prefix}/study/web-dev`} className="glass-panel p-6 rounded-theme border border-card-border hover:border-primary-container transition-colors group cursor-pointer neon-glow-hover flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-card-border pb-4">
                <Clock className="w-8 h-8 text-primary" />
                <h3 className="font-display text-2xl font-bold group-hover:text-primary transition-colors">Web Dev</h3>
              </div>
              <p className="text-sm text-on-surface-variant flex-1">
                Full-stack architectures, modern frontend frameworks, and cloud deployments. Track side projects and system design concepts.
              </p>
              <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between text-xs font-mono uppercase tracking-widest text-primary">
                <span>Enter Nexus</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
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
          color: editingClass.color,
          type: editingClass.type
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
