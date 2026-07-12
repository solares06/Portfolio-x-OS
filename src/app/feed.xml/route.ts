import { getPublishedPosts } from "@/lib/actions/portfolio";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await getPublishedPosts();
  const site_url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const feedItems = posts.map((post) => {
    return `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${site_url}/blog/${post.slug}</link>
        <guid>${site_url}/blog/${post.slug}</guid>
        <pubDate>${new Date(post.published_at!).toUTCString()}</pubDate>
        <description><![CDATA[${post.summary}]]></description>
      </item>
    `;
  }).join("");

  const feed = `<?xml version="1.0" encoding="utf-8"?>
  <rss version="2.0">
    <channel>
      <title>Portfolio.os Blog</title>
      <link>${site_url}</link>
      <description>Thoughts on software engineering and design.</description>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      ${feedItems}
    </channel>
  </rss>`;

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
