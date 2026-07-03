import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/mdx";

export default function BlogPage() {
  const allPosts = getAllPosts("blog");
  const featured = allPosts.find((p) => p.meta.featured);
  const rest = allPosts.filter((p) => !p.meta.featured);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-20 pb-12">
      {/* Header */}
      <section className="space-y-4 pt-4">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 italic">
          Thoughts on form &amp; void
        </h1>
        <p className="max-w-xl text-base text-foreground/70 leading-relaxed">
          Essays and explorations concerning architectural stillness, digital
          minimalism, and the interplay of space in modern design.
        </p>
      </section>

      {/* Featured Post */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="block group">
          <article className="grid grid-cols-1 md:grid-cols-2 bg-gray-800 rounded-theme overflow-hidden shadow-theme">
            {/* Text side */}
            <div className="p-8 sm:p-12 flex flex-col justify-between text-white space-y-8">
              <div className="space-y-6">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-wider bg-white/90 text-gray-800 px-3 py-1 rounded">
                  {featured.meta.category}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-snug">
                  {featured.meta.title}
                </h2>
                <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
                  {featured.meta.excerpt}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">
                Read Article
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
            {/* Image side */}
            <div className="relative min-h-[280px] md:min-h-0">
              <Image
                src={featured.meta.coverImage}
                alt={featured.meta.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </article>
        </Link>
      )}

      {/* Post Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {rest.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
            <article className="bg-card rounded-theme shadow-theme border border-card-border overflow-hidden flex flex-col h-full">
              {/* Cover image */}
              <div className="relative aspect-[3/2] w-full overflow-hidden">
                <Image
                  src={post.meta.coverImage}
                  alt={post.meta.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Card body */}
              <div className="p-6 flex flex-col flex-1 space-y-4">
                {/* Category + date */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded">
                    {post.meta.category}
                  </span>
                  <span className="text-foreground/40">{post.meta.date}</span>
                </div>

                {/* Title */}
                <h3 className="font-display text-lg font-bold leading-snug group-hover:text-primary transition-colors">
                  {post.meta.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-foreground/60 leading-relaxed line-clamp-3 flex-1">
                  {post.meta.excerpt}
                </p>

                {/* Read link */}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/50 group-hover:text-primary transition-colors pt-2">
                  Read
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
