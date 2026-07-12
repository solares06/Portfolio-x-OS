"use server";

import { createClient } from "@/lib/supabase/server";
import type { SponsorshipStat, TeamMember, ArchivePhoto } from "@/lib/mock-data";

export async function getDirectives() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("ec_directives")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching directives:", error);
    return [];
  }

  return data.map((d: Record<string, unknown>) => {
    let typeLabel = String(d.type).toUpperCase();
    if (d.due_label) {
      typeLabel = `${typeLabel}: ${d.due_label}`;
    } else if (d.type === 'meeting' && d.due_label) {
      typeLabel = `MEETING`; // handled similarly
    }

    let color = 'outline';
    if (d.type === 'deadline') color = 'primary';
    else if (d.type === 'meeting') color = 'tertiary';

    return {
      id: String(d.id),
      type: String(d.type).toUpperCase(),
      typeLabel: typeLabel,
      title: String(d.title),
      subtitle: d.detail ? String(d.detail) : (d.type === 'meeting' ? String(d.due_label) : undefined),
      color: color
    };
  });
}

export async function getSponsorshipStats(): Promise<SponsorshipStat[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("ec_sponsorship_stats")
    .select("*")
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching sponsorship stats:", error);
    return [];
  }

  if (!data) return [];

  return [
    {
      id: "stat1",
      label: "TARGET ACQUISITION",
      value: String(data.target_amount),
      progress: 75,
      progressColor: "primary"
    },
    {
      id: "stat2",
      label: "ACTIVE LEADS",
      value: String(data.active_leads),
      trendText: "+3 THIS WEEK",
      trendColor: "primary"
    },
    {
      id: "stat3",
      label: "CONVERSION RATE",
      value: String(data.conversion_rate),
      trendText: "STABLE",
      trendColor: "tertiary"
    },
    {
      id: "stat4",
      label: "EVENT READINESS",
      value: String(data.event_readiness),
      progress: parseInt(String(data.event_readiness)) || 82,
      progressColor: "on-surface"
    }
  ];
}

export async function getTeam(): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("ec_team_members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching team:", error);
    return [];
  }

  return data.map((t: Record<string, unknown>) => {
    const avatarUrl = t.avatar_url as string | undefined;
    const nameStr = String(t.name);
    return {
      id: String(t.id),
      name: nameStr,
      role: String(t.role),
      avatarUrl,
      initials: !avatarUrl ? nameStr.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : undefined
    };
  });
}

export async function getArchive(): Promise<ArchivePhoto[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("ec_archive")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching archive:", error);
    return [];
  }

  return data.map((a: Record<string, unknown>) => ({
    id: String(a.id),
    url: String(a.image_url),
    label: String(a.title)
  }));
}

// -------------------------------------------------------------
// CRUD Operations
// -------------------------------------------------------------

export async function createDirective(type: string, title: string, detail?: string, due_label?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_directives")
    .insert([{ type, title, detail, due_label, user_id: user.id }]);

  if (error) throw error;
}

export async function editDirective(id: string, type: string, title: string, detail?: string, due_label?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_directives")
    .update({ type, title, detail, due_label })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteDirective(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_directives")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function updateSponsorshipStats(target_amount: number, active_leads: number, conversion_rate: string, event_readiness: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Since it's a single row, we just update it where user_id matches
  const { error } = await supabase
    .from("ec_sponsorship_stats")
    .update({ target_amount, active_leads, conversion_rate, event_readiness })
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function createTeamMember(name: string, role: string, avatar_url?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_team_members")
    .insert([{ name, role, avatar_url, user_id: user.id }]);

  if (error) throw error;
}

export async function editTeamMember(id: string, name: string, role: string, avatar_url?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_team_members")
    .update({ name, role, avatar_url })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_team_members")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// -------------------------------------------------------------
// Extensions: Archive Upload
// -------------------------------------------------------------
export async function uploadArchivePhoto(title: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const file = formData.get('file') as File;
  if (!file) throw new Error("No file uploaded");

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Math.random()}.${fileExt}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('ec-archive')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('ec-archive')
    .getPublicUrl(fileName);

  // Insert to database
  const { error: dbError } = await supabase
    .from("ec_archive")
    .insert([{ user_id: user.id, title, image_url: publicUrl }]);

  if (dbError) throw dbError;
}

// -------------------------------------------------------------
// Extensions: Sponsor Pipeline
// -------------------------------------------------------------
export async function getSponsorPipeline() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("ec_sponsor_pipeline")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sponsor pipeline:", error);
    return [];
  }
  return data;
}

export async function createSponsorLead(company: string, status: string, amount?: string, notes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_sponsor_pipeline")
    .insert([{ user_id: user.id, company, status, amount, notes }]);
  if (error) throw error;
}

export async function updateSponsorLead(id: string, company: string, status: string, amount?: string, notes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_sponsor_pipeline")
    .update({ company, status, amount, notes })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function deleteSponsorLead(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_sponsor_pipeline")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

// -------------------------------------------------------------
// Extensions: Meeting Notes
// -------------------------------------------------------------
export async function getMeetingNotes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("ec_meeting_notes")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching meeting notes:", error);
    return [];
  }
  return data;
}

export async function createMeetingNote(title: string, date: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_meeting_notes")
    .insert([{ user_id: user.id, title, date, content }]);
  if (error) throw error;
}

export async function updateMeetingNote(id: string, title: string, date: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_meeting_notes")
    .update({ title, date, content })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}

export async function deleteMeetingNote(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("ec_meeting_notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw error;
}
