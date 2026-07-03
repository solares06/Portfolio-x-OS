"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/media", label: "Media" },
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center space-x-6 p-6 font-display font-medium text-lg border-b border-gray-100/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      {links.map(({ href, label }) => {
        // Active if exact match or if it's a subpage (like /projects/some-project) but not for home
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        
        return (
          <Link
            key={href}
            href={href}
            className={`transition-colors duration-200 ${
              isActive 
                ? "text-primary font-bold border-b-2 border-primary pb-1" 
                : "text-foreground/70 hover:text-primary"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
