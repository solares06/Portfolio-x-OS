import Link from "next/link";
import { getPublishedPosts } from "@/lib/actions/portfolio";
import { Calendar, ArrowLeft } from "lucide-react";

export const revalidate = 60;

export default async function BlogIndex() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="fixed top-0 w-full backdrop-blur-md bg-background/80 border-b border-border z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground">Thoughts on software engineering, design, and building products.</p>
        </header>

        <div className="space-y-12">
          {posts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-mono">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_at!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{post.summary}</p>
              </Link>
            </article>
          ))}
          {posts.length === 0 && (
            <p className="text-muted-foreground italic">No posts published yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
