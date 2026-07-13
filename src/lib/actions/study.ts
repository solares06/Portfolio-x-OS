"use server";

import { createClient } from "../supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

// --- LEETCODE STATS ---

export async function getLeetCodeCountToday(dateStr: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from("study_leetcode_stats")
    .select("count")
    .eq("user_id", user.id)
    .eq("date", dateStr)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(error);
    return 0;
  }
  return data?.count || 0;
}

export async function updateLeetCodeCount(dateStr: string, count: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("study_leetcode_stats")
    .upsert({ user_id: user.id, date: dateStr, count }, { onConflict: 'user_id,date' });

  if (error) throw error;
}

export async function reviewStudySubtopic(subtopicId: string, quality: number) {
  // quality: 0 (Hard), 1 (Good), 2 (Easy) -> maps to 1, 3, 5 for SM-2
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("study_subtopics")
    .select("interval_days, ease_factor")
    .eq("id", subtopicId)
    .single();

  if (error || !data) throw new Error("Failed to fetch subtopic");

  let { interval_days, ease_factor } = data;
  let next_review = new Date();

  // SM-2 Algorithm mapping: 0 -> 1 (Hard), 1 -> 3 (Good), 2 -> 5 (Easy)
  const q = quality === 0 ? 1 : quality === 1 ? 3 : 5;

  if (q < 3) {
    interval_days = 1;
  } else {
    if (interval_days === 0) {
      interval_days = 1;
    } else if (interval_days === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
  }

  ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3;

  next_review.setDate(next_review.getDate() + interval_days);

  const { error: updateError } = await supabase
    .from("study_subtopics")
    .update({ 
      last_reviewed: new Date().toISOString(),
      next_review: next_review.toISOString(),
      interval_days,
      ease_factor
    })
    .eq("id", subtopicId);

  if (updateError) throw updateError;
}

export async function importCurriculumWithAI(domain: string, syllabusText: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY is not configured on the server." };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

  const prompt = `
You are an expert curriculum designer. The user has provided a raw syllabus or course outline.
Your task is to parse this syllabus into structured Topics, and for each Topic, a list of Subtopics.
Return ONLY valid JSON in the following format:
{
  "topics": [
    {
      "title": "Topic Name",
      "subtopics": ["Subtopic 1", "Subtopic 2"]
    }
  ]
}
If the syllabus is very short, break it down logically. If it's very long, group it logically into a max of 10-12 major topics.
Here is the syllabus text:
${syllabusText}
  `;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const aiResponse = result.response.text();
  let cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Raw AI response:", aiResponse);
      return { success: false, error: "Failed to parse AI response. Try a simpler syllabus." };
    }

    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      return { success: false, error: "Invalid AI response format" };
    }

  // Insert topics and subtopics
  for (const topic of parsed.topics) {
    const { data: topicData, error: topicError } = await supabase
      .from("study_topics")
      .insert([{ 
        user_id: user.id, 
        domain, 
        title: topic.title, 
        source_name: 'AI Generated' 
      }])
      .select()
      .single();

    if (topicError || !topicData) continue;

      if (topic.subtopics && Array.isArray(topic.subtopics)) {
        const subtopicInserts = topic.subtopics.map((st: string) => ({
          topic_id: topicData.id,
          title: st
        }));
        if (subtopicInserts.length > 0) {
          await supabase.from("study_subtopics").insert(subtopicInserts);
        }
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "An unknown server error occurred" };
  }
}

export async function getStudyConsistencyData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("study_consistency_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function toggleStudyConsistencyDay(dateStr: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("study_consistency_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", dateStr)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("study_consistency_logs")
      .update({ completed: !existing.completed })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("study_consistency_logs")
      .insert([{ user_id: user.id, date: dateStr, completed: true }]);
    if (error) throw error;
  }
}
