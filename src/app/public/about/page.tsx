import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto w-full space-y-20 pb-12 pt-4 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="space-y-8">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            A pursuit of <br className="hidden sm:block" />
            <em className="italic font-normal text-gray-500">quiet interfaces</em>
          </h1>
          
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors group"
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
      <section className="border-t border-gray-200 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h2 className="font-display text-2xl font-bold text-gray-900 sticky top-8">
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

    </div>
  );
}
