"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProjectDomain } from "@/lib/mock-data";

export async function getProjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data;
}

export async function getProjectDomains(): Promise<ProjectDomain[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("project_domains")
    .select("*, projects(*)")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching project domains:", error);
    return [];
  }

  return data.map((domain: Record<string, unknown>) => {
    const domainProjects = Array.isArray(domain.projects) ? domain.projects : [];
    const sortedProjects = domainProjects.sort((a: Record<string, unknown>, b: Record<string, unknown>) => 
      new Date(String(b.updated_at)).getTime() - new Date(String(a.updated_at)).getTime()
    );

    let activeCount = 0;
    let blockedCount = 0;
    let archivedCount = 0;
    const conceptualCount = 0;

    const mappedProjects = sortedProjects.map((p: Record<string, unknown>) => {
      let phaseTag = String(p.status).toUpperCase();
      let phaseColor = 'outline';
      if (p.status === 'active') { phaseColor = 'primary'; activeCount++; }
      else if (p.status === 'blocked') { phaseColor = 'error'; blockedCount++; phaseTag = 'BLOCKED'; }
      else if (p.status === 'done') { phaseColor = 'secondary'; archivedCount++; phaseTag = 'DONE'; }
      else { archivedCount++; }
      
      return {
        id: String(p.id),
        title: String(p.title),
        phaseTag,
        phaseColor: phaseColor as 'primary' | 'secondary' | 'error' | 'tertiary' | 'outline',
        progress: 50,
        description: p.description ? String(p.description) : "",
        contributors: [{ initials: "ME" }]
      };
    });

    let healthColor = 'outline';
    if (domain.status_label === 'HEALTHY') healthColor = 'primary';
    else if (domain.status_label === 'TRAINING') healthColor = 'tertiary';

    return {
      id: String(domain.id),
      name: String(domain.name),
      icon: domain.icon ? String(domain.icon).toLowerCase() : 'code',
      activeCount,
      blockedCount,
      archivedCount,
      conceptualCount,
      health: (domain.status_label ? String(domain.status_label) : 'IDLE') as 'HEALTHY' | 'TRAINING' | 'IDLE',
      healthColor: healthColor as 'primary' | 'tertiary' | 'outline',
      projects: mappedProjects,
      defaultExpanded: true
    };
  });
}

// -------------------------------------------------------------
// CRUD Operations
// -------------------------------------------------------------

export async function createDomain(name: string, icon: string, status_label: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("project_domains")
    .insert([{ name, icon, status_label, user_id: user.id }]);

  if (error) throw error;
}

export async function editDomain(id: string, name: string, icon: string, status_label: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("project_domains")
    .update({ name, icon, status_label })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteDomain(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("project_domains")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function createProject(domain_id: string, title: string, description: string, status: string, progress: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("projects")
    .insert([{ domain_id, title, description, status, progress, user_id: user.id }]);

  if (error) throw error;
}

export async function editProject(id: string, domain_id: string, title: string, description: string, status: string, progress: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("projects")
    .update({ domain_id, title, description, status, progress })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}
