"use server";

import { createClient } from "../supabase/server";

export async function getSemesterTracker() {
  const supabase = await createClient();
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
