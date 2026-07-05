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
