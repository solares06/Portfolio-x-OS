"use client";

import React, { useState } from "react";
import { Database, ArrowLeft, CheckCircle, Circle, Github, ExternalLink, Plus, Code2 } from "lucide-react";
import Link from "next/link";

const DSA_TOPICS = [
  {
    id: "1",
    title: "Arrays & Hashing",
    progress: 100,
    subtopics: [
      { id: "1a", title: "Two Sum", completed: true },
      { id: "1b", title: "Valid Anagram", completed: true },
      { id: "1c", title: "Top K Frequent Elements", completed: true },
    ],
    notes: "Core patterns: Hash Map for O(1) lookups, Prefix Sums for range queries.",
    resources: "NeetCode 150 - Arrays & Hashing",
  },
  {
    id: "2",
    title: "Two Pointers",
    progress: 50,
    subtopics: [
      { id: "2a", title: "Valid Palindrome", completed: true },
      { id: "2b", title: "3Sum", completed: false },
      { id: "2c", title: "Container With Most Water", completed: false },
    ],
    notes: "Remember to sort the array first for 3Sum to easily skip duplicates.",
    resources: "LeetCode Patterns",
  },
  {
    id: "3",
    title: "Dynamic Programming (1D)",
    progress: 0,
    subtopics: [
      { id: "3a", title: "Climbing Stairs", completed: false },
      { id: "3b", title: "House Robber", completed: false },
      { id: "3c", title: "Longest Palindromic Substring", completed: false },
    ],
    notes: "Always start with the recursive relation, then memoize, then bottom-up tabular.",
    resources: "Striver's DP Series",
  },
];

const DSA_PROJECTS = [
  {
    id: "p1",
    title: "Algorithm Visualizer",
    status: "In Progress",
    tech: ["React", "TypeScript", "Framer Motion"],
    description: "An interactive web app to visualize sorting algorithms (Merge, Quick, Heap) and graph traversals (BFS, DFS, Dijkstra).",
    repo: "https://github.com/souranil/algo-vis",
  }
];

export default function DSAWorkspacePage() {
  const [topics, setTopics] = useState(DSA_TOPICS);
  const [expandedTopic, setExpandedTopic] = useState<string | null>("2");

  const toggleSubtopic = (topicId: string, subtopicId: string) => {
    setTopics(topics.map(topic => {
      if (topic.id === topicId) {
        const newSubtopics = topic.subtopics.map(sub => 
          sub.id === subtopicId ? { ...sub, completed: !sub.completed } : sub
        );
        const completedCount = newSubtopics.filter(s => s.completed).length;
        const newProgress = Math.round((completedCount / newSubtopics.length) * 100);
        return { ...topic, subtopics: newSubtopics, progress: newProgress };
      }
      return topic;
    }));
  };

  return (
    <div className="p-8 h-full w-full overflow-y-auto animate-in fade-in duration-500 custom-scrollbar bg-background z-10">
      
      {/* Navigation & Header */}
      <div className="mb-8 space-y-4 border-b border-card-border pb-6 relative">
        <Link href="/os/study" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-colors font-mono text-xs uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Nexus
        </Link>
        <div className="flex items-center gap-4 mt-4">
          <div className="p-3 bg-primary-container/10 border border-primary-container/30 rounded-xl relative">
            <div className="absolute inset-0 bg-primary-container/20 blur-xl"></div>
            <Database className="w-8 h-8 text-primary-container relative z-10" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">Data Structures & Algorithms</h1>
            <p className="font-mono text-sm text-on-surface-variant mt-1 tracking-widest uppercase">Sub-Nexus Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Topic Tracker */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-bold text-foreground">Pattern Mastery</h2>
            <button className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary-container hover:text-primary transition-colors bg-primary-container/10 px-3 py-1.5 border border-primary-container/30 rounded">
              <Plus className="w-4 h-4" /> Add Pattern
            </button>
          </div>

          <div className="space-y-4">
            {topics.map(topic => (
              <div key={topic.id} className="glass-panel border border-card-border rounded-theme overflow-hidden relative">
                {topic.progress === 100 && (
                  <div className="absolute inset-0 bg-primary-container/5 pointer-events-none"></div>
                )}
                <div 
                  className="p-5 cursor-pointer hover:bg-surface-variant/30 transition-colors flex items-center justify-between relative z-10"
                  onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                >
                  <div className="flex items-center gap-4">
                    {topic.progress === 100 ? (
                      <CheckCircle className="w-5 h-5 text-primary-container" />
                    ) : (
                      <Circle className="w-5 h-5 text-on-surface-variant" />
                    )}
                    <h3 className={`font-bold text-lg ${topic.progress === 100 ? 'text-primary-container' : 'text-foreground'}`}>
                      {topic.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container transition-all duration-500 neon-glow" style={{ width: `${topic.progress}%` }}></div>
                    </div>
                    <span className="font-mono text-xs font-bold text-primary-container w-8 text-right">{topic.progress}%</span>
                  </div>
                </div>

                {expandedTopic === topic.id && (
                  <div className="p-5 pt-0 border-t border-card-border/50 bg-surface-container-lowest/30 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      
                      {/* Subtopics (Problems) */}
                      <div className="space-y-3">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Key Problems</h4>
                        <div className="space-y-2">
                          {topic.subtopics.map(sub => (
                            <label key={sub.id} className="flex items-start gap-3 p-2 hover:bg-surface-variant rounded cursor-pointer transition-colors group">
                              <input 
                                type="checkbox" 
                                checked={sub.completed}
                                onChange={() => toggleSubtopic(topic.id, sub.id)}
                                className="mt-1 form-checkbox bg-surface-container-lowest border-card-border text-primary-container focus:ring-primary-container rounded-sm w-4 h-4 transition-colors" 
                              />
                              <span className={`text-sm flex-1 transition-colors ${sub.completed ? 'text-on-surface-variant line-through' : 'text-foreground group-hover:text-primary-container'}`}>
                                {sub.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Meta (Notes & Resources) */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Algorithm Notes</h4>
                          <p className="text-sm text-foreground/80 bg-surface-container-low p-3 border border-card-border rounded font-body leading-relaxed">
                            {topic.notes}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Learning Resources</h4>
                          <p className="text-sm text-primary-container bg-primary-container/5 p-3 border border-primary-container/20 rounded font-body leading-relaxed flex items-start gap-2">
                            <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" />
                            {topic.resources}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Projects & Resources */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-bold text-foreground">Implementations</h2>
            <button className="text-on-surface-variant hover:text-primary-container transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {DSA_PROJECTS.map(proj => (
              <div key={proj.id} className="glass-panel p-5 rounded-theme border border-card-border hover:border-primary-container/50 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary-container transition-colors">{proj.title}</h3>
                  <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-1 border rounded ${
                    proj.status === 'Completed' ? 'border-primary-container/30 bg-primary-container/10 text-primary-container' : 'border-tertiary-container/30 bg-tertiary-container/10 text-tertiary-container'
                  }`}>
                    {proj.status}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mb-4 line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {proj.tech.map(t => (
                    <span key={t} className="text-[10px] font-mono text-outline bg-surface-container-highest px-2 py-1 rounded">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="border-t border-card-border/50 pt-4 flex justify-between items-center">
                  <span className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Repository</span>
                  <a href={proj.repo} target="_blank" rel="noopener noreferrer" className="text-primary-container hover:text-primary transition-colors p-1 hover:bg-primary-container/10 rounded">
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Activity / Quick links */}
          <div className="glass-panel p-5 rounded-theme border border-card-border mt-8">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center justify-between p-2 hover:bg-surface-variant rounded transition-colors group">
                <span className="text-sm text-on-surface-variant group-hover:text-foreground">LeetCode</span>
                <ExternalLink className="w-3 h-3 text-outline group-hover:text-primary-container" />
              </a>
              <a href="#" className="flex items-center justify-between p-2 hover:bg-surface-variant rounded transition-colors group">
                <span className="text-sm text-on-surface-variant group-hover:text-foreground">NeetCode.io</span>
                <ExternalLink className="w-3 h-3 text-outline group-hover:text-primary-container" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
