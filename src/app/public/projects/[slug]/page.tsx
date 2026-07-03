import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllPosts } from "@/lib/mdx";

export function generateStaticParams() {
  const projects = getAllPosts("projects");
  return projects
    .filter((p) => !p.meta.externalUrl)
    .map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getPostBySlug("projects", params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.meta.title,
    description: project.meta.description,
  };
}

const components = {
  h2: (props: React.ComponentProps<"h2">) => <h2 className="font-display text-2xl font-bold mt-12 mb-4 text-gray-900" {...props} />,
  h3: (props: React.ComponentProps<"h3">) => <h3 className="font-display text-xl font-bold mt-10 mb-4 text-gray-900" {...props} />,
  p: (props: React.ComponentProps<"p">) => <p className="text-foreground/80 leading-relaxed mb-4" {...props} />,
  ul: (props: React.ComponentProps<"ul">) => <ul className="list-disc list-inside space-y-2 text-foreground/80 pl-1 mb-4" {...props} />,
  blockquote: (props: React.ComponentProps<"blockquote">) => <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 text-foreground/70 italic text-lg" {...props} />,
};

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = getPostBySlug("projects", params.slug);
  if (!project) notFound();

  return (
    <article className="max-w-3xl mx-auto w-full pb-20">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/50 hover:text-primary transition-colors mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Projects
      </Link>

      {/* Header */}
      <header className="space-y-6 mb-12">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.meta.tags?.map((tag: string) => (
            <span
              key={tag}
              className="text-[11px] font-semibold uppercase tracking-wider border border-gray-300 text-gray-600 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-gray-900">
          {project.meta.title}
        </h1>
        <p className="text-lg text-foreground/60 leading-relaxed">{project.meta.description}</p>

        {project.meta.externalUrl && (
          <a
            href={project.meta.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Visit Live Site
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </header>

      {/* Cover image */}
      <div className="relative w-full aspect-[2/1] rounded-theme overflow-hidden shadow-theme mb-14">
        <Image
          src={project.meta.coverImage}
          alt={project.meta.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="space-y-5">
        <MDXRemote source={project.content} components={components} />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 mt-16 pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all projects
        </Link>
      </div>
    </article>
  );
}
