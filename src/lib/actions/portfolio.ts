"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function uploadPortfolioImage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("portfolio-media")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Failed to upload image");
  }

  const { data } = supabase.storage
    .from("portfolio-media")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function generateBlogFromPdf(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No PDF file provided");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is not configured");

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Data = buffer.toString("base64");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = "Convert this PDF document into a beautifully formatted Markdown (MDX) blog post. Use appropriate headings (starting at H1 or H2), bold text for emphasis, bullet points, and clean up any weird PDF artifacts or raw text errors. Do not summarize unless it makes sense for a blog, but try to retain the core content and structure. Return ONLY the markdown content, with no introductory conversational text and NO markdown formatting blocks like ```markdown wrapping it.";

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Data,
        mimeType: "application/pdf",
      },
    },
  ]);

  return result.response.text();
}
