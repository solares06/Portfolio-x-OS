"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- Public Access ---

export async function getPublishedPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_posts")
    .select("title, slug, summary, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

export async function getReadingList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_reading_list")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function getGuestbookEntries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_guestbook")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function addGuestbookEntry(name: string, message: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("portfolio_guestbook")
    .insert([{ name, message }]);

  if (error) throw error;
  revalidatePath("/");
}

export async function trackPageView(path: string) {
  const supabase = await createClient();
  // We fire and forget
  supabase.from("portfolio_page_views").insert([{ path }]).then();
}

export async function getPageViews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_page_views")
    .select("path");

  if (error) {
    console.error(error);
    return 0;
  }
  return data.length;
}

// --- Authenticated OS Access ---

export async function getAllPosts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("portfolio_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching portfolio posts:", error);
    return [];
  }
  return data;
}

export async function savePost(id: string | null, title: string, slug: string, summary: string, content_mdx: string, published: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const payload = {
    title,
    slug,
    summary,
    content_mdx,
    published,
    user_id: user.id,
    published_at: published ? new Date().toISOString() : null
  };

  let error;
  if (id) {
    const res = await supabase.from("portfolio_posts").update(payload).eq("id", id).eq("user_id", user.id);
    error = res.error;
  } else {
    const res = await supabase.from("portfolio_posts").insert([payload]);
    error = res.error;
  }

  if (error) throw error;
  revalidatePath("/os/blog");
  revalidatePath("/");
  revalidatePath(`/blog/${slug}`);
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("portfolio_posts").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/os/blog");
}

export async function saveReadingListItem(title: string, author: string, url: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("portfolio_reading_list").insert([{
    title, author, url, status, user_id: user.id
  }]);

  if (error) throw error;
  revalidatePath("/os/blog");
  revalidatePath("/");
}

export async function deleteReadingListItem(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("portfolio_reading_list").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/os/blog");
  revalidatePath("/");
}
