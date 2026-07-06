"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Clock,
  Filter,
  Code,
  Brain,
  Cpu,
  Microscope,
  ChevronDown,
  ArrowRight,
  Plus,
  Edit2,
  Trash2
} from "lucide-react";
import { 
  getProjectDomains,
  createDomain, editDomain, deleteDomain,
  createProject, editProject, deleteProject
} from "@/lib/actions/projects";
import type { ProjectDomain, ProjectData } from "@/lib/mock-data";
import DomainModal from "../components/DomainModal";
import ProjectModal from "../components/ProjectModal";
import ConfirmModal from "@/components/ConfirmModal";

function ProjectCard({ project, onEdit, onDelete }: { project: ProjectData, onEdit: (p: ProjectData) => void, onDelete: (id: string, title: string) => void }) {
  const getPhaseColors = (color: string) => {
    switch (color) {
      case 'primary': return 'border-primary-container/30 text-primary-container bg-primary-container/10';
      case 'error': return 'border-error/30 text-error bg-error/10';
      case 'secondary': return 'border-secondary-container/30 text-secondary-container bg-secondary-container/10';
      case 'tertiary': return 'border-tertiary-container/30 text-tertiary-container bg-tertiary-container/10';
      default: return 'border-outline-variant/30 text-on-surface-variant bg-surface-variant/50';
    }
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-primary-container shadow-[0_0_8px_rgba(0,242,255,0.5)]';
      case 'error': return 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]';
      case 'secondary': return 'bg-secondary-container shadow-[0_0_8px_rgba(112,0,255,0.5)]';
      case 'tertiary': return 'bg-tertiary-container shadow-[0_0_8px_rgba(254,216,58,0.5)]';
      default: return 'bg-outline-variant';
    }
  };

  return (
    <div className="p-4 rounded border border-outline-variant/50 bg-surface-container hover:border-primary-container/50 transition-colors group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h4 className="font-body-lg text-on-surface font-semibold">{project.title}</h4>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase tracking-widest ${getPhaseColors(project.phaseColor)}`}>
            {project.phaseTag}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-32 h-1 bg-surface-bright rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(project.phaseColor)}`} 
              style={{ width: `${project.progress}%` }} 
            />
          </div>
          <span className="font-mono text-xs text-on-surface-variant w-8 text-right">{project.progress}%</span>
        </div>
      </div>
      <p className="font-body-sm text-outline mb-4">{project.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.contributors.map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-surface-variant border border-surface flex items-center justify-center text-[10px] font-mono text-on-surface">
              {c.initials}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(project)} className="p-1 hover:bg-primary-container/20 text-on-surface-variant hover:text-primary-container rounded transition-colors"><Edit2 className="w-3 h-3" /></button>
            <button onClick={() => onDelete(project.id, project.title)} className="p-1 hover:bg-error/20 text-on-surface-variant hover:text-error rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
          </div>
          <button className="font-mono text-xs text-on-surface-variant hover:text-primary-container transition-colors flex items-center gap-1 uppercase tracking-widest ml-2">
            Details <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DomainSection({ 
  domain, expanded, onToggle, 
  onEdit, onDelete, onAddProject, 
  onEditProject, onDeleteProject 
}: { 
  domain: ProjectDomain, expanded: boolean, onToggle: () => void,
  onEdit: (d: ProjectDomain) => void, onDelete: (id: string, name: string) => void,
  onAddProject: (domainId: string) => void,
  onEditProject: (p: ProjectData, domainId: string) => void,
  onDeleteProject: (id: string, title: string) => void
}) {
  const IconMap: Record<string, React.ElementType> = {
    code: Code,
    brain: Brain,
    cpu: Cpu,
    microscope: Microscope
  };
  const Icon = IconMap[domain.icon] || Code;

  let headerIconColor = "text-on-surface-variant";
  let headerIconBg = "bg-outline-variant/20 border-outline-variant/50";
  let healthDotColor = "bg-outline";
  let healthTextColor = "text-outline";
  
  if (domain.healthColor === 'primary') {
    headerIconColor = "text-primary-container";
    headerIconBg = "bg-primary-container/10 border-primary-container/30";
    healthDotColor = "bg-primary-container status-pip";
    healthTextColor = "text-primary-container neon-text";
  } else if (domain.healthColor === 'tertiary') {
    headerIconColor = "text-tertiary-container";
    headerIconBg = "bg-tertiary-container/10 border-tertiary-container/30";
    healthDotColor = "bg-tertiary-container";
    healthTextColor = "text-tertiary-container";
  }

  const subtitleParts = [];
  if (domain.activeCount > 0) subtitleParts.push(`${domain.activeCount} Active Pipelines`);
  else subtitleParts.push(`0 Active`);
  if (domain.blockedCount > 0) subtitleParts.push(`${domain.blockedCount} Blocked`);
  if (domain.conceptualCount && domain.conceptualCount > 0) subtitleParts.push(`${domain.conceptualCount} Conceptual`);
  if (domain.archivedCount > 0) subtitleParts.push(`${domain.archivedCount} Archived`);

  return (
    <div className={`border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden transition-all duration-300 ${expanded ? 'glow-border' : 'hover:border-primary-container/30'}`}>
      <button 
        className={`w-full flex items-center justify-between p-6 transition-colors cursor-pointer ${expanded ? 'bg-surface-container-low' : 'bg-surface-container-lowest hover:bg-surface-variant/50'}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded flex items-center justify-center border ${headerIconBg}`}>
            <Icon className={`w-5 h-5 ${headerIconColor}`} />
          </div>
          <div className="text-left">
            <h3 className="font-display text-2xl text-on-surface font-semibold tracking-tight">{domain.name}</h3>
            <p className="font-mono text-xs text-outline mt-1">{subtitleParts.join(' • ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className={`items-center gap-2 hidden sm:flex ${domain.health === 'IDLE' ? 'opacity-50' : ''}`}>
            <span className={`w-2 h-2 rounded-full ${healthDotColor}`}></span>
            <span className={`font-mono text-[11px] uppercase tracking-widest font-bold ${healthTextColor}`}>{domain.health}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={(e) => { e.stopPropagation(); onAddProject(domain.id); }} className="p-1 text-on-surface-variant hover:text-primary-container transition-colors"><Plus className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(domain); }} className="p-1 text-on-surface-variant hover:text-primary-container transition-colors"><Edit2 className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(domain.id, domain.name); }} className="p-1 text-on-surface-variant hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
            <ChevronDown className={`w-6 h-6 text-on-surface-variant transition-transform duration-300 ${expanded ? 'rotate-180 text-primary-container' : ''}`} />
          </div>
        </div>
      </button>

      <div 
        className={`bg-surface-dim transition-all duration-300 ease-in-out overflow-hidden`}
        style={{ 
          maxHeight: expanded ? '2000px' : '0', 
          opacity: expanded ? 1 : 0 
        }}
      >
        <div className="p-6 space-y-4">
          {domain.projects.length > 0 ? (
            domain.projects.map(p => (
              <ProjectCard 
                key={p.id} 
                project={p} 
                onEdit={(proj) => onEditProject(proj, domain.id)}
                onDelete={onDeleteProject}
              />
            ))
          ) : (
            <div className="p-4 rounded border border-outline-variant/50 bg-surface-container text-center text-outline font-mono text-xs py-10">
              No active projects in this domain.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OSProjectsPage() {
  const [domains, setDomains] = useState<ProjectDomain[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  type ConfirmModalState = { isOpen: boolean; type: 'domain' | 'project'; id: string; title: string };

  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<ProjectDomain | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ project: ProjectData, domainId: string } | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, type: 'domain', id: '', title: '' });

  const load = async () => {
    try {
      const data = await getProjectDomains();
      setDomains(data);
      setExpandedDomains(prev => 
        Object.keys(prev).length > 0 
          ? prev 
          : data.reduce((acc: Record<string, boolean>, d: ProjectDomain) => ({ ...acc, [d.id]: !!d.defaultExpanded }), {})
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const handleSaveDomain = async (name: string, icon: string, status_label: string) => {
    // Optimistic UI could be added here, but load() handles it fast enough
    (async () => {
      try {
        if (editingDomain) await editDomain(editingDomain.id, name, icon, status_label);
        else await createDomain(name, icon, status_label);
      } finally { await load(); }
    })();
  };

  const handleSaveProject = async (domain_id: string, title: string, description: string, status: string, progress: number) => {
    (async () => {
      try {
        if (editingProject) await editProject(editingProject.project.id, domain_id, title, description, status, progress);
        else await createProject(domain_id, title, description, status, progress);
      } finally { await load(); }
    })();
  };

  const handleDelete = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });
    
    // Optimistic update
    if (type === 'domain') {
      setDomains(domains.filter(d => d.id !== id));
    } else {
      setDomains(domains.map(d => ({
        ...d,
        projects: d.projects.filter(p => p.id !== id)
      })));
    }

    (async () => {
      try {
        if (type === 'domain') await deleteDomain(id);
        else await deleteProject(id);
      } finally { await load(); }
    })();
  };


  const toggleDomain = (id: string) => {
    setExpandedDomains(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) return <div className="p-8">Loading Projects...</div>;

  return (
    <div className="p-8 h-full w-full overflow-y-auto animate-in fade-in duration-500 custom-scrollbar relative z-0">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-outline-variant pb-6">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search systems..." 
            className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant text-on-surface focus:ring-0 focus:border-primary-container pl-10 py-1.5 font-mono text-sm transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant group relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-container rounded-full status-pip"></span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant">
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Page Header Area */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-2">Project Domains</h2>
          <p className="font-body-lg text-on-surface-variant">Categorized operational tasks and developmental pipelines.</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => { setEditingDomain(null); setIsDomainModalOpen(true); }}
            className="px-4 py-2 border border-outline-variant bg-surface-container-lowest rounded text-on-surface hover:text-primary-container hover:border-primary-container transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Domain
          </button>
          <button className="px-4 py-2 border border-outline-variant rounded text-on-surface-variant hover:text-primary hover:border-primary-container transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Domains List */}
      <div className="space-y-6 max-w-5xl mx-auto">
        {domains.map((domain) => (
          <DomainSection 
            key={domain.id} 
            domain={domain} 
            expanded={expandedDomains[domain.id]} 
            onToggle={() => toggleDomain(domain.id)} 
            onEdit={(d) => { setEditingDomain(d); setIsDomainModalOpen(true); }}
            onDelete={(id, name) => setConfirmModal({ isOpen: true, type: 'domain', id, title: name })}
            onAddProject={(dId) => { setEditingProject(null); setIsProjectModalOpen(true); }}
            onEditProject={(proj, dId) => { setEditingProject({ project: proj, domainId: dId }); setIsProjectModalOpen(true); }}
            onDeleteProject={(id, title) => setConfirmModal({ isOpen: true, type: 'project', id, title })}
          />
        ))}
      </div>
      
      {/* Bottom spacing */}
      <div className="h-24 md:h-8"></div>

      <DomainModal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
        onSave={handleSaveDomain}
        initialData={editingDomain ? { name: editingDomain.name, icon: editingDomain.icon, status_label: editingDomain.health } : undefined}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        domains={domains}
        initialData={editingProject ? { 
          domain_id: editingProject.domainId, 
          title: editingProject.project.title, 
          description: editingProject.project.description, 
          status: editingProject.project.phaseTag.toLowerCase(), 
          progress: editingProject.project.progress 
        } : undefined}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleDelete}
        title={`Delete ${confirmModal.type === 'domain' ? 'Domain' : 'Project'}`}
        message={`Are you sure you want to delete "${confirmModal.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
