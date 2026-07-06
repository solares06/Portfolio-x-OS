import { Hero } from "@/components/Hero";
import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const experience = [
  {
    role: "Creative Director",
    company: "Studio Null",
    date: "2023 - Present",
    description: "Leading a team of 4 designers to craft high-end minimalist web experiences. Focusing on organic interaction paradigms and tactile digital spaces."
  },
  {
    role: "Senior UI/UX Designer",
    company: "InnovateLabs",
    date: "2021 - 2023",
    description: "Spearheaded the redesign of their flagship enterprise dashboard, prioritizing clarity, space, and typographic hierarchy over dense information architecture."
  },
  {
    role: "Product Designer",
    company: "TechCorp",
    date: "2019 - 2021",
    description: "Designed core mobile experiences for consumer-facing financial applications. Established their initial design system."
  }
];

export default function HomePage() {
  const projects = getAllPosts("projects").slice(0, 2);

  return (
    <div className="w-full space-y-32 pb-32">
      <Hero />
      
      {/* Full About Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="space-y-8">
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            A pursuit of <br className="hidden sm:block" />
            <em className="italic font-normal text-gray-500">quiet interfaces</em>
          </h2>
          
          <div className="space-y-6 text-base sm:text-lg text-foreground/80 leading-relaxed max-w-lg">
            <p>
              I am a digital product designer with a background in traditional print and editorial design. My philosophy stems from the belief that software should feel less like a machine and more like an extension of the human hand.
            </p>
            <p>
              I focus heavily on <strong className="text-gray-900 font-semibold">structural minimalism</strong>, emphasizing whitespace, stark typography, and micro-interactions that feel physically grounded. 
            </p>
            <p>
              Currently, I am exploring how we can build interfaces that respect the user&apos;s attention, shifting away from aggressive notifications and cluttered dashboards toward calm, purposeful spaces.
            </p>
          </div>
          
          <div className="pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors group shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start a Conversation
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="relative w-full aspect-[4/5] rounded-theme overflow-hidden shadow-theme bg-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=600"
                alt="Workspace"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="relative w-full aspect-square rounded-theme overflow-hidden shadow-theme bg-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600"
                alt="Architecture"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="space-y-4 pt-12">
            <div className="relative w-full aspect-square rounded-theme overflow-hidden shadow-theme bg-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600"
                alt="Minimalist design"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="relative w-full aspect-[4/5] rounded-theme overflow-hidden shadow-theme bg-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=600"
                alt="Details"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 border-t border-gray-200 pt-16">
          <div className="lg:col-span-1">
            <h2 className="font-display text-2xl font-bold text-gray-900 sticky top-24">
              Experience
            </h2>
          </div>
          
          <div className="lg:col-span-3 space-y-12">
            {experience.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 group">
                <div className="sm:col-span-1 text-sm font-semibold uppercase tracking-wider text-gray-400 pt-1">
                  {item.date}
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <h3 className="font-display text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {item.role}
                  </h3>
                  <div className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    {item.company}
                  </div>
                  <p className="text-gray-600 leading-relaxed max-w-lg">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Work Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="font-display text-3xl font-bold text-gray-900">Featured Work</h2>
          <p className="text-foreground/60 max-w-xl mx-auto">
            A curated selection of my projects, research, and thought leadership across technology and creative design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => {
            const isExternal = !!project.meta.externalUrl;
            const href = isExternal ? project.meta.externalUrl! : `/projects/${project.slug}`;

            return (
              <Link
                href={href}
                key={project.slug}
                className="group block h-full"
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <article className="bg-white rounded-theme shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-500 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-1">
                  {/* Cover */}
                  <div className="relative w-full aspect-video overflow-hidden bg-gray-50 border-b border-gray-100">
                    <Image
                      src={project.meta.coverImage}
                      alt={project.meta.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1 space-y-5">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.meta.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2.5 flex-1">
                      <h3 className="font-display text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {project.meta.title}
                      </h3>
                      <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
                        {project.meta.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary pt-2 mt-auto">
                      View Project
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
        
        <div className="flex justify-center pt-8">
          <Link 
            href="/projects"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            View All Projects
          </Link>
        </div>
      </section>
    </div>
  );
}
