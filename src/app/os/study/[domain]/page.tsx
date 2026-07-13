"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronRight, ExternalLink, CheckSquare, Square, FolderGit2, BookOpen, Plus, Trash2, Edit2, Save, X, Clock, Sparkles } from "lucide-react";
import { 
  getStudyDomainData, 
  createStudyTopic, 
  updateStudyTopic, 
  deleteStudyTopic, 
  createStudySubtopic, 
  toggleStudySubtopic, 
  deleteStudySubtopic, 
  createStudyProject, 
  updateStudyProject, 
  deleteStudyProject,
  getLeetCodeCountToday,
  updateLeetCodeCount,
  importCurriculumWithAI
} from "@/lib/actions/study";

// --- Types ---
type Subtopic = { id: string; title: string; is_completed: boolean; topic_id: string; created_at: string; };
type Topic = { 
  id: string; 
  title: string; 
  source_url: string; 
  source_name: string;
  notes: string; 
  subtopics: Subtopic[]; 
};
type Project = { 
  id: string; 
  title: string; 
  description: string;
  notes: string;
  status: string; 
  github_url?: string 
};

export default function StudyDomainPage({ params }: { params: { domain: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefix = pathname.startsWith("/os") ? "/os" : "";
  const domainKey = params.domain;
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{topics: Topic[], projects: Project[]}>({ topics: [], projects: [] });
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const [leetcodeCount, setLeetcodeCount] = useState(0);

  // Modals state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicForm, setTopicForm] = useState<{id?: string, title: string, sourceName: string, sourceUrl: string}>({ title: '', sourceName: '', sourceUrl: '' });
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<{id?: string, title: string, description: string, status: string, githubUrl: string, notes: string}>({ title: '', description: '', status: 'Planning', githubUrl: '', notes: '' });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [syllabusText, setSyllabusText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Inline forms
  const [newSubtopicTitle, setNewSubtopicTitle] = useState("");
  const [addingSubtopicTo, setAddingSubtopicTo] = useState<string | null>(null);
  
  // Real-time note saving debounce
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData(true);
  }, [domainKey]);

  const loadData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const domainData = await getStudyDomainData(domainKey);
    setData(domainData);
    if (domainKey === 'dsa') {
      const today = new Date().toISOString().split('T')[0];
      const count = await getLeetCodeCountToday(today);
      setLeetcodeCount(count);
    }
    if (isInitial) setLoading(false);
  };

  const handleUpdateLeetCode = async (increment: number) => {
    const newCount = Math.max(0, leetcodeCount + increment);
    setLeetcodeCount(newCount);
    const today = new Date().toISOString().split('T')[0];
    await updateLeetCodeCount(today, newCount);
  };

  // --- Topic Handlers ---
  const handleSaveTopic = async () => {
    if (!topicForm.title) return;
    if (topicForm.id) {
      await updateStudyTopic(topicForm.id, { title: topicForm.title, source_name: topicForm.sourceName, source_url: topicForm.sourceUrl });
    } else {
      await createStudyTopic(domainKey, topicForm.title, topicForm.sourceName, topicForm.sourceUrl);
    }
    setIsTopicModalOpen(false);
    loadData();
  };

  const handleDeleteTopic = async (id: string) => {
    if (confirm("Are you sure you want to delete this topic and all its subtopics?")) {
      await deleteStudyTopic(id);
      loadData();
    }
  };

  const openEditTopic = (topic: Topic) => {
    setTopicForm({ id: topic.id, title: topic.title, sourceName: topic.source_name || '', sourceUrl: topic.source_url || '' });
    setIsTopicModalOpen(true);
  };

  const openNewTopic = () => {
    setTopicForm({ title: '', sourceName: '', sourceUrl: '' });
    setIsTopicModalOpen(true);
  };

  const handleImportCurriculum = async () => {
    if (!syllabusText.trim()) return;
    setIsImporting(true);
    try {
      await importCurriculumWithAI(domainKey, syllabusText);
      setSyllabusText("");
      setIsImportModalOpen(false);
      loadData();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to import syllabus.");
    } finally {
      setIsImporting(false);
    }
  };

  // --- Subtopic Handlers ---
  const handleToggleSubtopic = async (id: string, currentStatus: boolean) => {
    // Optimistic UI
    const newData = { ...data };
    for (const t of newData.topics) {
      const s = t.subtopics.find(st => st.id === id);
      if (s) s.is_completed = !currentStatus;
    }
    setData(newData);
    
    await toggleStudySubtopic(id, !currentStatus);
  };

  const handleAddSubtopic = async (topicId: string) => {
    if (!newSubtopicTitle) return;
    await createStudySubtopic(topicId, newSubtopicTitle);
    setNewSubtopicTitle("");
    setAddingSubtopicTo(null);
    loadData();
  };

  const handleDeleteSubtopic = async (id: string) => {
    await deleteStudySubtopic(id);
    loadData();
  };


  // --- Notes Handler ---
  const handleNotesChange = (topicId: string, newNotes: string) => {
    // Optimistic UI update
    const newData = { ...data };
    const topic = newData.topics.find(t => t.id === topicId);
    if (topic) topic.notes = newNotes;
    setData(newData);
  };

  const handleNotesBlur = async (topicId: string, notes: string) => {
    setSavingNotes(prev => ({...prev, [topicId]: true}));
    await updateStudyTopic(topicId, { notes });
    setTimeout(() => {
      setSavingNotes(prev => ({...prev, [topicId]: false}));
    }, 500);
  };

  // --- Project Handlers ---
  const handleSaveProject = async () => {
    if (!projectForm.title) return;
    if (projectForm.id) {
      await updateStudyProject(projectForm.id, { 
        title: projectForm.title, 
        description: projectForm.description, 
        status: projectForm.status, 
        github_url: projectForm.githubUrl,
        notes: projectForm.notes 
      });
    } else {
      await createStudyProject(domainKey, projectForm.title, projectForm.description, projectForm.status, projectForm.githubUrl, projectForm.notes);
    }
    setIsProjectModalOpen(false);
    loadData();
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteStudyProject(id);
      loadData();
    }
  };

  const openEditProject = (project: Project) => {
    setProjectForm({ 
      id: project.id, 
      title: project.title, 
      description: project.description || '', 
      status: project.status || 'Planning', 
      githubUrl: project.github_url || '',
      notes: project.notes || ''
    });
    setIsProjectModalOpen(true);
  };

  const openNewProject = () => {
    setProjectForm({ title: '', description: '', status: 'Planning', githubUrl: '', notes: '' });
    setIsProjectModalOpen(true);
  };


  const calculateProgress = (subtopics: Subtopic[]) => {
    if (subtopics.length === 0) return 0;
    const completed = subtopics.filter(s => s.is_completed).length;
    return Math.round((completed / subtopics.length) * 100);
  };

  const getDomainTitle = () => {
    if (domainKey === 'ml') return "Machine Learning";
    if (domainKey === 'dsa') return "Data Structures";
    if (domainKey === 'web-dev') return "Web Development";
    return domainKey;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 space-y-8 h-full custom-scrollbar relative bg-background">
      
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-card-border pb-6 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`${prefix}/study`)}
              className="p-2 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant hover:text-on-surface"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-display text-4xl text-foreground font-bold">{getDomainTitle()} <span className="text-primary font-mono text-sm ml-2">_NEXUS</span></h1>
              <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mt-2">Track topics, projects, and progression</p>
            </div>
          </div>
          
          {domainKey === 'dsa' && (
            <div className="bg-surface-container border border-card-border rounded-xl px-4 py-2 flex items-center gap-4 shadow-sm">
              <div>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">LeetCode Today</span>
                <span className="font-display text-xl font-bold text-primary leading-none">{leetcodeCount} <span className="text-sm font-normal text-on-surface-variant">solved</span></span>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleUpdateLeetCode(1)} className="w-6 h-6 bg-surface-variant hover:bg-primary-container hover:text-on-primary-container rounded flex items-center justify-center transition-colors text-on-surface-variant">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => handleUpdateLeetCode(-1)} className="w-6 h-6 bg-surface-variant hover:bg-error hover:text-error-container rounded flex items-center justify-center transition-colors text-on-surface-variant">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                </button>
              </div>
            </div>
          )}
        </header>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content: Topics */}
            <div className="space-y-6 lg:col-span-2">


              <div className="flex justify-between items-end mb-2">
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Curriculum
                </h2>
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsImportModalOpen(true)} className="text-xs font-mono uppercase tracking-widest text-primary hover:text-primary transition-colors flex items-center gap-1 group">
                    <Sparkles className="w-3 h-3 group-hover:animate-pulse" /> AI Import
                  </button>
                  <button onClick={openNewTopic} className="text-xs font-mono uppercase tracking-widest text-primary hover:text-primary transition-colors flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Topic
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {data.topics.map((topic) => {
                  const progress = calculateProgress(topic.subtopics);
                  const isExpanded = expandedTopicId === topic.id;
                  
                  return (
                    <div key={topic.id} className="glass-panel border border-card-border rounded-xl overflow-hidden transition-all duration-300 bg-surface-container-low/50">
                      {/* Accordion Header */}
                      <div 
                        className="p-5 cursor-pointer hover:bg-surface-variant/30 transition-colors flex items-center justify-between"
                        onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                      >
                        <div className="flex-1 pr-4">
                          <h3 className={`font-bold text-lg transition-colors flex items-center gap-2 ${isExpanded ? 'text-primary' : 'text-on-surface'}`}>
                            {topic.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                                <div className="h-full bg-primary-container transition-all duration-500" style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="font-mono text-[10px] text-on-surface-variant">{progress}%</span>
                            </div>
                            {topic.source_name && (
                              <span className="text-[10px] font-mono text-outline uppercase tracking-widest truncate max-w-[150px]">
                                Src: {topic.source_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-on-surface-variant flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                      </div>

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div className="p-5 border-t border-card-border/50 bg-surface/50 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200 relative">
                          {/* Absolute Actions */}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button onClick={() => openEditTopic(topic)} className="p-1.5 text-on-surface-variant hover:text-secondary-container transition-colors rounded hover:bg-surface-variant"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDeleteTopic(topic.id)} className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded hover:bg-surface-variant"><Trash2 className="w-3 h-3" /></button>
                          </div>

                          {/* Subtopics Checklist */}
                          <div className="pt-2">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Checklist</h4>
                              <button 
                                onClick={() => setAddingSubtopicTo(topic.id)}
                                className="text-[10px] font-mono uppercase text-primary hover:text-primary flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3"/> Add Item
                              </button>
                            </div>
                            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                              {topic.subtopics.map(sub => (
                                <div key={sub.id} className="flex items-start gap-3 p-2 rounded hover:bg-surface-variant/30 group transition-colors">
                                  <button 
                                    onClick={() => handleToggleSubtopic(sub.id, sub.is_completed)}
                                    className={`mt-0.5 shrink-0 transition-colors ${sub.is_completed ? 'text-primary' : 'text-outline group-hover:text-primary/50'}`}
                                  >
                                    {sub.is_completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                  </button>
                                  <span className={`text-sm leading-tight flex-1 transition-colors ${sub.is_completed ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                                    {sub.title}
                                  </span>
                                  <button onClick={() => handleDeleteSubtopic(sub.id)} className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error p-0.5 transition-all"><X className="w-3 h-3" /></button>
                                </div>
                              ))}
                              
                              {/* Add Subtopic Input */}
                              {addingSubtopicTo === topic.id && (
                                <div className="flex items-center gap-2 mt-2">
                                  <input 
                                    autoFocus
                                    type="text" 
                                    value={newSubtopicTitle}
                                    onChange={(e) => setNewSubtopicTitle(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtopic(topic.id); if (e.key === 'Escape') setAddingSubtopicTo(null); }}
                                    className="flex-1 bg-surface-container-lowest border border-card-border rounded px-2 py-1 text-sm focus:border-primary-container outline-none"
                                    placeholder="New item..."
                                  />
                                  <button onClick={() => handleAddSubtopic(topic.id)} className="text-primary hover:text-primary"><CheckSquare className="w-4 h-4" /></button>
                                  <button onClick={() => setAddingSubtopicTo(null)} className="text-on-surface-variant"><X className="w-4 h-4" /></button>
                                </div>
                              )}
                              
                              {topic.subtopics.length === 0 && addingSubtopicTo !== topic.id && (
                                <div className="text-xs text-on-surface-variant font-mono p-2">No items yet.</div>
                              )}
                            </div>
                          </div>

                          {/* Notes & Source */}
                          <div className="flex flex-col h-full pt-2">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">Research Notes</h4>
                              {savingNotes[topic.id] && <span className="text-[10px] font-mono text-primary flex items-center gap-1"><Save className="w-3 h-3" /> Saved</span>}
                            </div>
                            <textarea 
                              value={topic.notes}
                              onChange={(e) => handleNotesChange(topic.id, e.target.value)}
                              onBlur={(e) => handleNotesBlur(topic.id, e.target.value)}
                              className="flex-1 w-full bg-surface-container-lowest border border-card-border rounded-lg p-3 text-sm text-on-surface focus:border-primary-container outline-none resize-none min-h-[150px] custom-scrollbar"
                              placeholder="Jot down key takeaways and findings here..."
                            />
                            {topic.source_url && (
                              <a 
                                href={topic.source_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center justify-center gap-2 py-2 bg-surface-container-high hover:bg-surface-variant transition-colors border border-outline-variant/30 rounded-lg text-xs font-mono uppercase tracking-widest text-on-surface"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Open Source Material
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {data.topics.length === 0 && (
                  <div className="text-center p-12 border border-dashed border-card-border rounded-xl">
                    <BookOpen className="w-8 h-8 text-on-surface-variant mx-auto mb-4 opacity-50" />
                    <p className="text-on-surface-variant font-mono text-xs uppercase tracking-widest">No topics added yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar: Due for Review & Projects */}
            <div className="space-y-6 lg:col-span-1">
              

              {domainKey !== 'dsa' && (
                <div className="space-y-6">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                    <FolderGit2 className="w-6 h-6 text-secondary-container" />
                    Projects
                  </h2>
                  <button onClick={openNewProject} className="text-xs font-mono uppercase tracking-widest text-secondary-container hover:text-secondary-container/80 transition-colors flex items-center gap-1">
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>

                <div className="space-y-4">
                  {data.projects.map(project => (
                    <div key={project.id} className="glass-panel border border-card-border rounded-xl p-5 hover:border-secondary-container/50 transition-colors group relative overflow-hidden">
                      {/* Status Indicator Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        project.status === 'Completed' ? 'bg-primary-container' : 
                        project.status === 'In Progress' ? 'bg-secondary-container' : 
                        'bg-tertiary-container'
                      }`}></div>
                      
                      {/* Hover Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                         <button onClick={() => openEditProject(project)} className="p-1.5 text-on-surface-variant hover:text-secondary-container transition-colors rounded hover:bg-surface-variant"><Edit2 className="w-3 h-3" /></button>
                         <button onClick={() => handleDeleteProject(project.id)} className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded hover:bg-surface-variant"><Trash2 className="w-3 h-3" /></button>
                      </div>
                      
                      <div className="pl-2">
                        <h3 className="font-bold text-on-surface mb-1 group-hover:text-secondary-container transition-colors pr-10">{project.title}</h3>
                        {project.description && <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{project.description}</p>}
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${
                            project.status === 'Completed' ? 'border-primary-container/30 text-primary bg-primary-container/10' : 
                            project.status === 'In Progress' ? 'border-secondary-container/30 text-secondary-container bg-secondary-container/10' : 
                            'border-tertiary-container/30 text-tertiary-container bg-tertiary-container/10'
                          }`}>
                            {project.status}
                          </span>
                          
                          {project.github_url && (
                            <a 
                              href={project.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-on-surface-variant hover:text-foreground transition-colors p-1"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {data.projects.length === 0 && (
                    <div className="text-center p-8 border border-dashed border-card-border rounded-xl">
                      <p className="text-on-surface-variant font-mono text-xs uppercase tracking-widest">No projects yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container border border-card-border rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold font-display mb-4">{topicForm.id ? 'Edit Topic' : 'New Topic'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Title</label>
                <input 
                  type="text" 
                  value={topicForm.title} 
                  onChange={e => setTopicForm({...topicForm, title: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-card-border rounded p-2 text-sm focus:border-primary-container outline-none"
                  placeholder="e.g. Neural Networks"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Source Name (Optional)</label>
                <input 
                  type="text" 
                  value={topicForm.sourceName} 
                  onChange={e => setTopicForm({...topicForm, sourceName: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-card-border rounded p-2 text-sm focus:border-primary-container outline-none"
                  placeholder="e.g. Stanford CS229"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Source URL (Optional)</label>
                <input 
                  type="text" 
                  value={topicForm.sourceUrl} 
                  onChange={e => setTopicForm({...topicForm, sourceUrl: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-card-border rounded p-2 text-sm focus:border-primary-container outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setIsTopicModalOpen(false)} className="px-4 py-2 rounded text-sm text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              <button onClick={handleSaveTopic} className="px-4 py-2 rounded text-sm bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-medium">Save Topic</button>
            </div>
          </div>
        </div>
      )}

      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container border border-card-border rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold font-display mb-4">{projectForm.id ? 'Edit Project' : 'New Project'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Title</label>
                <input 
                  type="text" 
                  value={projectForm.title} 
                  onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-card-border rounded p-2 text-sm focus:border-secondary-container outline-none"
                  placeholder="e.g. MNIST Classifier"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Description</label>
                <textarea 
                  value={projectForm.description} 
                  onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-card-border rounded p-2 text-sm focus:border-secondary-container outline-none resize-none h-20 custom-scrollbar"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Status</label>
                <select 
                  value={projectForm.status}
                  onChange={e => setProjectForm({...projectForm, status: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-card-border rounded p-2 text-sm focus:border-secondary-container outline-none"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">GitHub URL (Optional)</label>
                <input 
                  type="text" 
                  value={projectForm.githubUrl} 
                  onChange={e => setProjectForm({...projectForm, githubUrl: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-card-border rounded p-2 text-sm focus:border-secondary-container outline-none"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-1">Notes / Todo (Optional)</label>
                <textarea 
                  value={projectForm.notes} 
                  onChange={e => setProjectForm({...projectForm, notes: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-card-border rounded p-2 text-sm focus:border-secondary-container outline-none resize-none h-20 custom-scrollbar"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 rounded text-sm text-on-surface-variant hover:bg-surface-variant transition-colors">Cancel</button>
              <button onClick={handleSaveProject} className="px-4 py-2 rounded text-sm bg-secondary-container text-on-secondary-container hover:bg-secondary transition-colors font-medium">Save Project</button>
            </div>
          </div>
        </div>
      )}


      {/* AI Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-card-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden glass-panel">
            <div className="p-4 border-b border-card-border flex justify-between items-center bg-primary-container/10">
              <h3 className="font-display text-xl font-bold flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                AI Curriculum Import
              </h3>
              <button onClick={() => !isImporting && setIsImportModalOpen(false)} className="text-on-surface-variant hover:text-foreground transition-colors p-1" disabled={isImporting}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-on-surface-variant">Paste your syllabus, course outline, or learning goals here. The AI will parse it into structured topics and subtopics.</p>
              <div>
                <textarea
                  value={syllabusText}
                  onChange={e => setSyllabusText(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-primary-container/30 rounded p-3 text-sm focus:border-primary-container outline-none resize-none h-64 custom-scrollbar"
                  placeholder="e.g. Week 1: Introduction to Data Structures...\n- Arrays\n- Linked Lists..."
                  disabled={isImporting}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-card-border">
              <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 rounded text-sm text-on-surface-variant hover:bg-surface-variant transition-colors" disabled={isImporting}>Cancel</button>
              <button 
                onClick={handleImportCurriculum} 
                className="px-6 py-2 rounded text-sm bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isImporting || !syllabusText.trim()}
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full"></div>
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Import Curriculum
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
