"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search, Bell, Clock, Filter, AlertCircle, Activity, ArrowRight,
  Users, ImageIcon, LayoutGrid, Plus, Edit2, Trash2, Upload, Briefcase, FileText
} from "lucide-react";
import { 
  getDirectives, getSponsorshipStats, getTeam, getArchive,
  createDirective, editDirective, deleteDirective,
  updateSponsorshipStats,
  createTeamMember, editTeamMember, deleteTeamMember,
  getSponsorPipeline, createSponsorLead, updateSponsorLead, deleteSponsorLead,
  getMeetingNotes, createMeetingNote, updateMeetingNote, deleteMeetingNote,
  uploadArchivePhoto
} from "@/lib/actions/extracurricular";
import type { SponsorshipStat, TeamMember, ArchivePhoto } from "@/lib/mock-data";
import DirectiveModal from "../components/DirectiveModal";
import SponsorshipStatsModal from "../components/SponsorshipStatsModal";
import TeamMemberModal from "../components/TeamMemberModal";
import SponsorModal, { SponsorData } from "@/components/SponsorModal";
import MeetingNoteModal, { MeetingNoteData } from "@/components/MeetingNoteModal";
import ConfirmModal from "@/components/ConfirmModal";

type Directive = { id: string; type: string; typeLabel: string; title: string; subtitle?: string; color: string };

export default function OSExtracurricularPage() {
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [stats, setStats] = useState<SponsorshipStat[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [archive, setArchive] = useState<ArchivePhoto[]>([]);
  
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  type ConfirmModalState = { isOpen: boolean; type: 'directive' | 'team' | 'sponsor' | 'note'; id: string; title: string };

  const [isDirectiveModalOpen, setIsDirectiveModalOpen] = useState(false);
  const [editingDirective, setEditingDirective] = useState<Directive | null>(null);

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<SponsorData | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<MeetingNoteData | null>(null);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, type: 'directive', id: '', title: '' });

  const refreshData = async () => {
    const [d, s, t, a, p, n] = await Promise.all([ 
      getDirectives(), getSponsorshipStats(), getTeam(), getArchive(),
      getSponsorPipeline(), getMeetingNotes()
    ]);
    setDirectives(d); setStats(s); setTeam(t); setArchive(a);
    setPipeline(p); setNotes(n);
  };

  useEffect(() => {
    async function loadData() {
      try { await refreshData(); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  // -- Handlers --
  const handleSaveDirective = async (type: string, title: string, detail: string, due_label: string) => {
    try {
      if (editingDirective) await editDirective(editingDirective.id, type, title, detail, due_label);
      else await createDirective(type, title, detail, due_label);
    } finally { await refreshData(); }
  };

  const handleSaveStats = async (targetAmount: number, activeLeads: number, conversionRate: string, eventReadiness: number) => {
    try { await updateSponsorshipStats(targetAmount, activeLeads, conversionRate, eventReadiness); }
    finally { await refreshData(); }
  };

  const handleSaveTeamMember = async (name: string, role: string, avatarUrl?: string) => {
    try {
      if (editingTeamMember) await editTeamMember(editingTeamMember.id, name, role, avatarUrl);
      else await createTeamMember(name, role, avatarUrl);
    } finally { await refreshData(); }
  };

  const handleSaveSponsor = async (data: SponsorData) => {
    try {
      if (data.id) await updateSponsorLead(data.id, data.company, data.status, data.amount, data.notes);
      else await createSponsorLead(data.company, data.status, data.amount, data.notes);
    } finally { await refreshData(); }
  };

  const handleSaveNote = async (data: MeetingNoteData) => {
    try {
      if (data.id) await updateMeetingNote(data.id, data.title, data.date, data.content);
      else await createMeetingNote(data.title, data.date, data.content);
    } finally { await refreshData(); }
  };

  const handleDelete = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });
    try {
      if (type === 'directive') await deleteDirective(id);
      else if (type === 'team') await deleteTeamMember(id);
      else if (type === 'sponsor') await deleteSponsorLead(id);
      else if (type === 'note') await deleteMeetingNote(id);
    } finally { await refreshData(); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const title = prompt("Enter a label for this archive photo:", "Untitled") || "Untitled";
      await uploadArchivePhoto(title, formData);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to upload photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getDirectiveBorderColor = (color: string) => {
    switch (color) {
      case 'primary': return 'border-primary-container';
      case 'tertiary': return 'border-tertiary-container';
      default: return 'border-outline';
    }
  };
  const getDirectiveTextColor = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'tertiary': return 'text-tertiary-container';
      default: return 'text-on-surface-variant';
    }
  };
  const getTrendColor = (color: string) => {
    switch (color) {
      case 'primary': return 'text-primary';
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Secured': return 'text-[#00FF88] border-[#00FF88] bg-[#00FF88]/10';
      case 'Negotiating': return 'text-[#00F2FF] border-[#00F2FF] bg-[#00F2FF]/10';
      case 'Contacted': return 'text-[#FFD700] border-[#FFD700] bg-[#FFD700]/10';
      case 'Rejected': return 'text-error border-error bg-error/10';
      default: return 'text-on-surface-variant border-on-surface-variant bg-surface-variant/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-full w-full bg-background text-on-background overflow-y-auto custom-scrollbar relative">
      
      <div className="p-4 md:p-8 flex flex-col gap-6 max-w-[1440px] mx-auto w-full flex-1 relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-primary border border-primary-container/30 bg-primary-container/10 px-2 py-1 rounded uppercase tracking-widest font-bold">MODULE: E-CELL</span>
              <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">SYS.STATE: ACTIVE</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-on-surface font-bold tracking-tight">E-Cell Command Center</h1>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6">
          
          {/* Active Directives */}
          <div className="col-span-4 lg:col-span-4 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl text-on-surface flex items-center gap-2 font-bold"><AlertCircle className="w-6 h-6 text-primary" /> Active Directives</h3>
              <button onClick={() => { setEditingDirective(null); setIsDirectiveModalOpen(true); }} className="text-on-surface-variant hover:text-primary transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[250px] max-h-[350px]">
              {loading ? <div className="text-on-surface-variant font-mono text-sm text-center py-4">Loading...</div> : 
               directives.length === 0 ? <div className="text-on-surface-variant font-mono text-sm text-center py-4">No active directives.</div> : 
               directives.map(dir => (
                <div key={dir.id} className={`bg-surface-container-high border-l-2 ${getDirectiveBorderColor(dir.color)} p-3 rounded-r-lg group-hover:bg-surface-variant transition-colors`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-mono text-[10px] uppercase tracking-widest font-bold ${getDirectiveTextColor(dir.color)}`}>{dir.typeLabel}</span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingDirective(dir); setIsDirectiveModalOpen(true); }} className="p-1 hover:text-primary text-on-surface-variant"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => setConfirmModal({ isOpen: true, type: 'directive', id: dir.id, title: dir.title })} className="p-1 hover:text-error text-on-surface-variant"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <p className="font-body text-sm text-on-surface mb-1 font-medium">{dir.title}</p>
                  {dir.subtitle && <span className="font-mono text-xs text-outline line-clamp-1">{dir.subtitle}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Sponsorship Telemetry */}
          <div className="col-span-4 md:col-span-8 lg:col-span-8 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl text-on-surface flex items-center gap-2 font-bold"><Activity className="w-6 h-6 text-primary" /> Sponsorship Telemetry</h3>
              <button onClick={() => setIsStatsModalOpen(true)} className="text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map(stat => (
                <div key={stat.id} className="bg-surface-container-high p-4 rounded-lg border border-outline-variant hover:border-primary-container/50 transition-colors">
                  <span className="font-mono text-[10px] text-on-surface-variant block mb-1 uppercase tracking-widest">{stat.label}</span>
                  <span className={`font-display text-3xl font-bold block ${stat.id === 'stat1' ? 'text-primary' : 'text-on-surface'}`}>{stat.value}</span>
                  {stat.progress !== undefined && stat.progressColor && (
                    <div className="w-full bg-surface-container-highest h-1 mt-3 rounded overflow-hidden">
                      <div className={`h-full rounded ${getProgressBgColor(stat.progressColor)}`} style={{ width: `${stat.progress}%` }}></div>
                    </div>
                  )}
                  {stat.trendText && stat.trendColor && <span className={`font-mono text-[10px] mt-2 block uppercase tracking-widest font-bold ${getTrendColor(stat.trendColor)}`}>{stat.trendText}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Core Operatives */}
          <div className="col-span-4 md:col-span-4 lg:col-span-6 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl text-on-surface flex items-center gap-2 font-bold"><Users className="w-6 h-6 text-primary" /> Core Operatives</h3>
              <button onClick={() => { setEditingTeamMember(null); setIsTeamModalOpen(true); }} className="text-on-surface-variant hover:text-primary transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar">
              {team.map(member => (
                <div key={member.id} className="flex items-center gap-4 p-2 bg-surface-container-high rounded border border-transparent hover:border-outline-variant transition-all group">
                  <div className="w-10 h-10 rounded bg-surface-container-lowest border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center text-on-surface-variant font-mono text-sm">
                    {member.avatarUrl ? <Image src={member.avatarUrl} alt={member.name} width={40} height={40} className="w-full h-full object-cover" /> : member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-base text-on-surface font-semibold truncate">{member.name}</p>
                    <p className="font-mono text-xs text-on-surface-variant truncate">{member.role}</p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingTeamMember(member); setIsTeamModalOpen(true); }} className="p-1.5 hover:bg-primary-container/20 text-on-surface-variant hover:text-primary rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => setConfirmModal({ isOpen: true, type: 'team', id: member.id, title: member.name })} className="p-1.5 hover:bg-error/20 text-on-surface-variant hover:text-error rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Memory Databank (Archive) */}
          <div className="col-span-4 md:col-span-4 lg:col-span-6 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl text-on-surface flex items-center gap-2 font-bold"><ImageIcon className="w-6 h-6 text-primary" /> Memory Databank</h3>
              <div className="relative">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50">
                  <Upload className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              {archive[0] ? (
                <div className="relative group rounded-lg overflow-hidden border border-outline-variant h-full min-h-[150px]">
                  <Image src={archive[0].url} alt="Archive" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="font-mono text-[10px] text-primary font-bold">{archive[0].label}</span>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-outline-variant rounded-lg flex items-center justify-center p-4">
                  <span className="text-xs font-mono text-on-surface-variant text-center">No archives found.<br/>Click upload to add.</span>
                </div>
              )}
              
              <div className="grid grid-rows-2 gap-4">
                {archive[1] && (
                  <div className="relative group rounded-lg overflow-hidden border border-outline-variant h-full">
                    <Image src={archive[1].url} alt="Archive" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="font-mono text-[10px] text-primary font-bold">{archive[1].label}</span>
                    </div>
                  </div>
                )}
                
                {archive.length > 0 && (
                  <div className="relative group rounded-lg overflow-hidden border border-outline-variant bg-surface-container-high flex flex-col items-center justify-center cursor-pointer hover:border-primary-container hover:bg-surface-variant transition-colors gap-2 h-full">
                    <LayoutGrid className="w-8 h-8 text-on-surface-variant group-hover:text-primary transition-colors" />
                    <span className="font-mono text-[10px] text-on-surface-variant group-hover:text-primary transition-colors uppercase tracking-widest font-bold">View All ({archive.length})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sponsor Pipeline */}
          <div className="col-span-4 md:col-span-8 lg:col-span-8 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl text-on-surface flex items-center gap-2 font-bold"><Briefcase className="w-6 h-6 text-primary" /> Sponsor Pipeline</h3>
              <button onClick={() => { setEditingSponsor(null); setIsSponsorModalOpen(true); }} className="text-on-surface-variant hover:text-primary transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-lg overflow-hidden custom-scrollbar max-h-[300px] overflow-y-auto">
              <table className="w-full text-left font-mono text-sm">
                <thead className="bg-surface-container-high border-b border-surface-variant sticky top-0 text-xs uppercase tracking-widest text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {pipeline.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-on-surface-variant">No leads in pipeline.</td></tr>
                  ) : pipeline.map(p => (
                    <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-4 py-3 font-semibold text-on-surface">
                        {p.company}
                        {p.notes && <div className="text-[10px] text-on-surface-variant line-clamp-1 max-w-[200px] font-normal">{p.notes}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] border uppercase tracking-widest font-bold ${getStatusColor(p.status)}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-primary font-bold">{p.amount ? `$${p.amount}` : '-'}</td>
                      <td className="px-4 py-3 w-20">
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingSponsor(p); setIsSponsorModalOpen(true); }} className="p-1 hover:text-primary text-on-surface-variant"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmModal({ isOpen: true, type: 'sponsor', id: p.id, title: p.company })} className="p-1 hover:text-error text-on-surface-variant"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Meeting Notes */}
          <div className="col-span-4 md:col-span-4 lg:col-span-4 glass-panel rounded-xl p-6 flex flex-col hover:border-primary-container hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl text-on-surface flex items-center gap-2 font-bold"><FileText className="w-6 h-6 text-primary" /> Meeting Notes</h3>
              <button onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }} className="text-on-surface-variant hover:text-primary transition-colors"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
              {notes.length === 0 ? <div className="text-on-surface-variant font-mono text-sm text-center py-4">No meeting notes.</div> : 
               notes.map(note => (
                 <div key={note.id} className="bg-surface-container-high border border-outline-variant p-4 rounded-lg group hover:border-primary-container transition-colors flex flex-col">
                   <div className="flex justify-between items-start mb-2">
                     <span className="font-mono text-[10px] text-primary uppercase tracking-widest">{new Date(note.date).toLocaleDateString()}</span>
                     <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingNote(note); setIsNoteModalOpen(true); }} className="p-1 hover:text-primary text-on-surface-variant"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => setConfirmModal({ isOpen: true, type: 'note', id: note.id, title: note.title })} className="p-1 hover:text-error text-on-surface-variant"><Trash2 className="w-3 h-3" /></button>
                    </div>
                   </div>
                   <h4 className="font-display text-lg font-bold text-on-surface mb-2">{note.title}</h4>
                   <p className="font-mono text-xs text-on-surface-variant line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>

      <DirectiveModal isOpen={isDirectiveModalOpen} onClose={() => setIsDirectiveModalOpen(false)} onSave={handleSaveDirective} initialData={editingDirective ? { type: editingDirective.type, title: editingDirective.title, detail: editingDirective.subtitle || '', due_label: editingDirective.typeLabel.split(': ')[1] || '' } : undefined} />
      <SponsorshipStatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} onSave={handleSaveStats} initialData={stats.length > 0 ? { target_amount: parseInt(stats[0].value) || 0, active_leads: parseInt(stats[1].value) || 0, conversion_rate: stats[2].value || '', event_readiness: parseInt(stats[3].value) || 0 } : undefined} />
      <TeamMemberModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} onSave={handleSaveTeamMember} initialData={editingTeamMember ? { name: editingTeamMember.name, role: editingTeamMember.role, avatar_url: editingTeamMember.avatarUrl } : undefined} />
      <SponsorModal isOpen={isSponsorModalOpen} onClose={() => setIsSponsorModalOpen(false)} onSave={handleSaveSponsor} initialData={editingSponsor} />
      <MeetingNoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSave={handleSaveNote} initialData={editingNote} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${confirmModal.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
