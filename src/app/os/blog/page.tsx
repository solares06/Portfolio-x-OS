import { getAllPosts, getReadingList, getPageViews } from "@/lib/actions/portfolio";
import { BlogManager } from "./components/BlogManager";
import { ReadingListManager } from "./components/ReadingListManager";
import { BarChart3, BookOpen, FileText } from "lucide-react";

export default async function OSBlogPage() {
  const [posts, readingList, pageViews] = await Promise.all([
    getAllPosts(),
    getReadingList(),
    getPageViews()
  ]);

  return (
    <div className="p-8 overflow-y-auto h-full w-full space-y-8 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-on-surface mb-2">
          Public Portfolio
        </h1>
        <p className="text-on-surface-variant font-mono text-sm">
          Manage your blog, reading list, and view analytics.
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-card-border rounded-theme p-6 glass-panel flex items-center gap-4">
          <div className="p-3 bg-primary-container/20 rounded-lg text-primary-container">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display">{posts.length}</div>
            <div className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Total Posts</div>
          </div>
        </div>
        
        <div className="bg-card border border-card-border rounded-theme p-6 glass-panel flex items-center gap-4">
          <div className="p-3 bg-secondary-container/20 rounded-lg text-secondary-container">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display">{readingList.length}</div>
            <div className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Books Tracked</div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-theme p-6 glass-panel flex items-center gap-4">
          <div className="p-3 bg-tertiary-container/20 rounded-lg text-tertiary-container">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold font-display">{pageViews}</div>
            <div className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Total Page Views</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold text-on-surface">Blog Posts</h2>
          <BlogManager initialPosts={posts} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold text-on-surface">Reading List</h2>
          <ReadingListManager initialList={readingList} />
        </section>
      </div>
    </div>
  );
}
