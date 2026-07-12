"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/media", label: "Media" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-6 z-50 flex justify-center w-full px-4 pt-2">
      <nav className="flex items-center space-x-1 p-1.5 font-display font-medium text-sm sm:text-base border border-gray-200/60 backdrop-blur-xl bg-white/70 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {links.map(({ href, label }) => {
          // Active if exact match or if it's a subpage (like /projects/some-project) but not for home
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          
          return (
            <Link
              key={href}
              href={href}
              className={`relative px-4 py-2 rounded-full transition-all duration-300 ${
                isActive 
                  ? "text-primary bg-primary/10 font-semibold" 
                  : "text-foreground/70 hover:text-primary hover:bg-black/5"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
