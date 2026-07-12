import Link from "next/link";
import { getPublishedPosts, getReadingList, getGuestbookEntries } from "@/lib/actions/portfolio";
import { GuestbookForm } from "./components/GuestbookForm";
import { BookOpen, Calendar, ArrowRight, Code2, MessageCircle, Briefcase, Terminal } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PortfolioHome() {
  const [posts, readingList, guestbook] = await Promise.all([
    getPublishedPosts(),
    getReadingList(),
    getGuestbookEntries(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary-container selection:text-on-primary-container">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-md bg-background/80 border-b border-border z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            Portfolio<span className="text-primary">.os</span>
          </Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="#blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link href="#reading" className="text-muted-foreground hover:text-foreground transition-colors">Reading</Link>
            <Link href="#guestbook" className="text-muted-foreground hover:text-foreground transition-colors">Guestbook</Link>
            <Link href="/os/login" className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
              <Terminal className="w-4 h-4" /> System
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24 space-y-32">
        {/* Hero Section */}
        <section className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
            Building things for <br className="hidden md:block"/> the web and beyond.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Hi, I'm a software engineer and designer. This is my digital garden where I share my thoughts, what I'm reading, and projects I'm working on.
          </p>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 border border-border rounded-full hover:bg-muted transition-colors">
              <Code2 className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 border border-border rounded-full hover:bg-muted transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 border border-border rounded-full hover:bg-muted transition-colors">
              <Briefcase className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Recent Writing */}
        <section id="blog" className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-display font-bold tracking-tight">Recent Writing</h2>
            <Link href="/blog" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {posts.slice(0, 4).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block p-6 border border-border rounded-2xl hover:border-primary/50 hover:bg-muted/30 transition-all">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-mono">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.published_at!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-muted-foreground line-clamp-2 leading-relaxed">{post.summary}</p>
              </Link>
            ))}
            {posts.length === 0 && (
              <p className="text-muted-foreground italic">No posts published yet.</p>
            )}
          </div>
        </section>

        {/* Reading List */}
        <section id="reading" className="space-y-8">
          <h2 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" /> What I'm Reading
          </h2>
          <div className="bg-muted/20 border border-border rounded-2xl p-6 md:p-8">
            <div className="space-y-6">
              {readingList.map((book) => (
                <div key={book.id} className="flex items-start justify-between border-b border-border/50 pb-6 last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-bold text-lg">{book.title}</h3>
                    <p className="text-muted-foreground">{book.author}</p>
                    {book.url && (
                      <a href={book.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                        View link ↗
                      </a>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider ${
                    book.status === 'reading' 
                      ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                      : 'bg-green-500/10 text-green-500 border border-green-500/20'
                  }`}>
                    {book.status}
                  </span>
                </div>
              ))}
              {readingList.length === 0 && (
                <p className="text-muted-foreground italic">Nothing on the reading list currently.</p>
              )}
            </div>
          </div>
        </section>

        {/* Guestbook */}
        <section id="guestbook" className="space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-display font-bold tracking-tight mb-4">Guestbook</h2>
            <p className="text-muted-foreground mb-8">Leave a message for me and other visitors. Let me know what you're building or just say hi!</p>
            
            <GuestbookForm />

            <div className="mt-12 space-y-6">
              {guestbook.map((entry) => (
                <div key={entry.id} className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{entry.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{entry.message}</p>
                </div>
              ))}
              {guestbook.length === 0 && (
                <p className="text-muted-foreground italic text-sm">No messages yet. Be the first!</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
