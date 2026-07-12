import Image from "next/image";
import Link from "next/link";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const pastOrgs = ["TechCorp", "InnovateLabs", "Global Ventures", "StartupX"];

export function Hero() {
  return (
    <section className="py-12 sm:py-20 space-y-20">
      {/* Main Hero — two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        {/* Left column — text content */}
        <div className="bg-card rounded-theme shadow-theme p-8 sm:p-12 flex flex-col justify-between space-y-10">
          <div className="space-y-8">
            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Creative Director &amp; UI/UX Specialist
            </p>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] tracking-tight text-gray-900">
              Designing <em className="italic font-normal">humanist</em><br className="hidden sm:block" />{" "}
              digital futures.
            </h1>

            {/* Bio */}
            <p className="max-w-lg text-base sm:text-lg text-foreground/80 leading-relaxed">
              I&apos;m a design student exploring the intersection of high-end minimalism
              and organic interaction. My work focuses on moving away from cold
              interfaces toward warmer, intentional digital experiences built on
              tactile neutrals.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Read Blog
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent border border-gray-300 text-foreground text-sm font-medium rounded-md hover:border-gray-500 hover:bg-black/5 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5"
              >
                Read Philosophy
              </Link>
            </div>

            {/* Social Row */}
            <div className="flex items-center gap-8 text-foreground/60">
              <a href="#" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider hover:text-primary transition-all duration-300 hover:-translate-y-0.5 group">
                <LinkedinIcon className="w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                LinkedIn
              </a>
              <a href="#" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider hover:text-primary transition-all duration-300 hover:-translate-y-0.5 group">
                <TwitterIcon className="w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                Twitter
              </a>
              <a href="#" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider hover:text-primary transition-all duration-300 hover:-translate-y-0.5 group">
                <InstagramIcon className="w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Right column — headshot */}
        <div className="relative w-full min-h-[400px] lg:min-h-0 rounded-theme overflow-hidden shadow-theme">
          <Image
            src="/images/headshot.png"
            alt="Profile headshot"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* Past Orgs Strip — below the fold */}
      <div className="text-center space-y-8 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Previously Collaborated With
        </p>
        <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16">
          {pastOrgs.map((org) => (
            <span
              key={org}
              className="text-lg sm:text-xl font-display font-bold text-foreground/30 hover:text-foreground/60 transition-colors cursor-default"
            >
              {org}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
