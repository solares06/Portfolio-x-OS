"use server";

import { createClient } from "../supabase/server";

export async function getSemesterTracker() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("study_classes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(c => ({
    id: c.id,
    subject: c.subject,
    instructor: c.instructor,
    nextDue: c.next_due,
    nextDueLabel: c.next_due_label,
    status: c.status,
    notes: c.notes,
    color: c.color
  }));
}

export async function getWorkspaces() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  // 1. Fetch workspaces
  const { data: workspacesData, error: wError } = await supabase
    .from("study_workspaces")
    .select("*")
    .order("created_at", { ascending: true });

  if (wError || !workspacesData || workspacesData.length === 0) {
    return [];
  }

  const workspaceIds = workspacesData.map(w => w.id);

  // 2. Fetch all related data in parallel
  const [notesRes, tasksRes, videosRes, msgsRes] = await Promise.all([
    supabase.from("study_notes").select("*").in("workspace_id", workspaceIds),
    supabase.from("study_tasks").select("*").in("workspace_id", workspaceIds),
    supabase.from("study_videos").select("*").in("workspace_id", workspaceIds),
    supabase.from("study_messages").select("*").in("workspace_id", workspaceIds)
  ]);

  const notes = notesRes.data || [];
  const tasks = tasksRes.data || [];
  const videos = videosRes.data || [];
  const messages = msgsRes.data || [];

  // 3. Reconstruct the complex object
  return workspacesData.map(w => ({
    id: w.id,
    title: w.title,
    icon: w.icon,
    progress: w.progress,
    leetcodeCount: w.leetcode_count,
    notes: notes.filter(n => n.workspace_id === w.id).map(n => ({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt
    })).length > 0 ? notes.filter(n => n.workspace_id === w.id).map(n => ({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt
    })) : undefined,
    tasks: tasks.filter(t => t.workspace_id === w.id).map(t => ({
      id: t.id,
      title: t.title,
      difficulty: t.difficulty,
      completed: t.completed
    })).length > 0 ? tasks.filter(t => t.workspace_id === w.id).map(t => ({
      id: t.id,
      title: t.title,
      difficulty: t.difficulty,
      completed: t.completed
    })) : undefined,
    videos: videos.filter(v => v.workspace_id === w.id).map(v => ({
      id: v.id,
      title: v.title,
      duration: v.duration,
      status: v.status,
      thumbnailUrl: v.thumbnail_url
    })).length > 0 ? videos.filter(v => v.workspace_id === w.id).map(v => ({
      id: v.id,
      title: v.title,
      duration: v.duration,
      status: v.status,
      thumbnailUrl: v.thumbnail_url
    })) : undefined,
    messages: messages.filter(m => m.workspace_id === w.id).map(m => ({
      id: m.id,
      user: m.sender_name,
      timeAgo: m.time_ago,
      content: m.content,
      reply: m.reply
    })).length > 0 ? messages.filter(m => m.workspace_id === w.id).map(m => ({
      id: m.id,
      user: m.sender_name,
      timeAgo: m.time_ago,
      content: m.content,
      reply: m.reply
    })) : undefined
  }));
}

// -------------------------------------------------------------
// CRUD Operations
// -------------------------------------------------------------

export async function createSemesterClass(
  subject: string, instructor: string, next_due: string, 
  next_due_label: string, status: string, notes: string, color: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_classes")
    .insert([{ subject, instructor, next_due, next_due_label, status, notes, color, user_id: user.id }]);

  if (error) throw error;
}

export async function editSemesterClass(
  id: string, subject: string, instructor: string, next_due: string, 
  next_due_label: string, status: string, notes: string, color: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_classes")
    .update({ subject, instructor, next_due, next_due_label, status, notes, color })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteSemesterClass(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_classes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function createWorkspace(title: string, icon: string, progress?: number, leetcode_count?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_workspaces")
    .insert([{ title, icon, progress, leetcode_count, user_id: user.id }]);

  if (error) throw error;
}

export async function editWorkspace(id: string, title: string, icon: string, progress?: number, leetcode_count?: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_workspaces")
    .update({ title, icon, progress, leetcode_count })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteWorkspace(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_workspaces")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// --- STUDY NEXUS (ML, DSA, WEB DEV) ---

interface StudySubtopicRow {
  id: string;
  title: string;
  is_completed: boolean;
  topic_id: string;
  created_at: string;
}

interface StudyTopicRow {
  id: string;
  title: string;
  source_url: string;
  source_name: string;
  notes: string;
  subtopics?: StudySubtopicRow[];
}

interface StudyProjectRow {
  id: string;
  title: string;
  description: string;
  notes: string;
  status: string;
  github_url?: string;
}

export async function getStudyDomainData(domain: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { topics: [], projects: [] };

  const { data: topicsData, error: topicsError } = await supabase
    .from("study_topics")
    .select("*, subtopics:study_subtopics(*)")
    .eq("user_id", user.id)
    .eq("domain", domain)
    .order("created_at", { ascending: true });

  const { data: projectsData, error: projectsError } = await supabase
    .from("study_projects")
    .select("*")
    .eq("user_id", user.id)
    .eq("domain", domain)
    .order("created_at", { ascending: true });

  if (topicsError || projectsError) {
    console.error(topicsError, projectsError);
  }

  const topics = (topicsData as StudyTopicRow[] | null || []).map((t) => ({
    ...t,
    subtopics: (t.subtopics || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }));

  return { topics, projects: (projectsData as StudyProjectRow[] | null) || [] };
}

export async function createStudyTopic(domain: string, title: string, sourceName?: string, sourceUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("study_topics")
    .insert([{ user_id: user.id, domain, title, source_name: sourceName, source_url: sourceUrl }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudyTopic(id: string, updates: { title?: string, source_name?: string, source_url?: string, notes?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_topics")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteStudyTopic(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_topics")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function createStudySubtopic(topicId: string, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("study_subtopics")
    .insert([{ topic_id: topicId, title }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleStudySubtopic(id: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_subtopics")
    .update({ is_completed: isCompleted })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteStudySubtopic(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("study_subtopics").delete().eq("id", id);
  if (error) throw error;
}

export async function createStudyProject(domain: string, title: string, description: string, status: string, githubUrl?: string, notes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("study_projects")
    .insert([{ user_id: user.id, domain, title, description, status, github_url: githubUrl, notes: notes || '' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudyProject(id: string, updates: { title?: string, description?: string, status?: string, github_url?: string, notes?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_projects")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteStudyProject(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}
