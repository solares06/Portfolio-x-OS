import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllPosts } from "@/lib/mdx";

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

const components = {
  h2: (props: React.ComponentProps<"h2">) => <h2 className="font-display text-2xl font-bold mt-12 mb-4 text-gray-900" {...props} />,
  h3: (props: React.ComponentProps<"h3">) => <h3 className="font-display text-xl font-bold mt-10 mb-4 text-gray-900" {...props} />,
  p: (props: React.ComponentProps<"p">) => <p className="text-foreground/80 leading-relaxed mb-4" {...props} />,
  ul: (props: React.ComponentProps<"ul">) => <ul className="list-disc list-inside space-y-2 text-foreground/80 pl-1 mb-4" {...props} />,
  blockquote: (props: React.ComponentProps<"blockquote">) => <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 text-foreground/70 italic text-lg" {...props} />,
};

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
        <MDXRemote source={post.content} components={components} />
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
