import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug } from "@/lib/actions/portfolio";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, Calendar } from "lucide-react";

export const revalidate = 60;

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="fixed top-0 w-full backdrop-blur-md bg-background/80 border-b border-border z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link href="/blog" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <header className="mb-12 border-b border-border/50 pb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-6">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <Calendar className="w-4 h-4" />
            {new Date(post.published_at!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
          <MDXRemote source={post.content_mdx} />
        </article>
      </main>
    </div>
  );
}
