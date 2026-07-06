import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import { MDXComponents } from "@/components/MDXComponents";

export function generateStaticParams() {
  const posts = getAllPosts("blog");
  return posts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug("blog", params.slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.meta.title,
    description: post.meta.excerpt,
  };
}



export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug("blog", params.slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto w-full pb-20">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/50 hover:text-primary transition-colors mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Posts
      </Link>

      {/* Post header */}
      <header className="space-y-6 mb-12">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded">
            {post.meta.category}
          </span>
          <span className="text-foreground/40">{post.meta.date}</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-gray-900">
          {post.meta.title}
        </h1>
        <p className="text-lg text-foreground/60 leading-relaxed">{post.meta.excerpt}</p>
      </header>

      {/* Cover image */}
      <div className="relative w-full aspect-[2/1] rounded-theme overflow-hidden shadow-theme mb-14">
        <Image
          src={post.meta.coverImage}
          alt={post.meta.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover"
        />
      </div>

      {/* Post content */}
      <div className="space-y-5">
        <MDXRemote source={post.content} components={MDXComponents} />
      </div>

      {/* Footer divider */}
      <div className="border-t border-gray-200 mt-16 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all posts
        </Link>
      </div>
    </article>
  );
}
