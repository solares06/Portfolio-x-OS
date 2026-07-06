import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/mdx";

export default function ProjectsPage() {
  const allProjects = getAllPosts("projects");
  const featured = allProjects.find((p) => p.meta.featured);
  const rest = allProjects.filter((p) => !p.meta.featured);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-20 pb-12">
      {/* Header */}
      <section className="space-y-4 pt-4">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Selected Works
        </h1>
        <p className="max-w-xl text-base text-foreground/70 leading-relaxed">
          An exploration of structural minimalism and organic digital interfaces.
          Selected case studies demonstrating high-end interaction design and
          editorial typography across various platforms.
        </p>
      </section>

      {/* Featured Project */}
      {featured && (
        <Link
          href={featured.meta.externalUrl || `/projects/${featured.slug}`}
          className="block group"
          {...(featured.meta.externalUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <article className="space-y-5">
            {/* Cover */}
            <div className="relative w-full aspect-[2/1] rounded-theme overflow-hidden shadow-theme bg-gray-100 transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-0.5">
              <Image
                src={featured.meta.coverImage}
                alt={featured.meta.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>

            {/* Tag chips */}
            <div className="flex flex-wrap gap-2">
              {featured.meta.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold uppercase tracking-wider border border-gray-300 text-gray-600 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title + description */}
            <div className="flex items-start justify-between gap-8">
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-snug group-hover:text-primary transition-colors">
                  {featured.meta.title}
                </h2>
                <p className="max-w-lg text-sm text-foreground/60 leading-relaxed">
                  {featured.meta.description}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 shrink-0 mt-2 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </article>
        </Link>
      )}

      {/* Project Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {rest.map((project) => {
          const isExternal = !!project.meta.externalUrl;
          const href = isExternal ? project.meta.externalUrl! : `/projects/${project.slug}`;

          return (
            <Link
              href={href}
              key={project.slug}
              className="group"
              {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <article className="space-y-4">
                {/* Cover */}
                <div className="relative w-full aspect-[6/5] rounded-theme overflow-hidden shadow-theme bg-gray-100 border border-card-border transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-0.5">
                  <Image
                    src={project.meta.coverImage}
                    alt={project.meta.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.meta.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold uppercase tracking-wider border border-gray-300 text-gray-600 px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title + description */}
                <div className="space-y-1.5">
                  <h3 className="font-display text-lg font-bold leading-snug group-hover:text-primary transition-colors">
                    {project.meta.title}
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed line-clamp-2">
                    {project.meta.description}
                  </p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
