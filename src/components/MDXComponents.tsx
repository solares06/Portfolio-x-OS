import React from "react";
import Image from "next/image";

export const MDXComponents = {
  h1: (props: any) => (
    <h1 className="font-display text-4xl sm:text-5xl font-bold mt-12 mb-6 text-gray-900 tracking-tight" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="font-display text-2xl sm:text-3xl font-bold mt-10 mb-4 text-gray-900" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="font-display text-xl sm:text-2xl font-bold mt-8 mb-4 text-gray-900" {...props} />
  ),
  p: (props: any) => (
    <p className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-6" {...props} />
  ),
  a: (props: any) => (
    <a className="text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 transition-colors" {...props} />
  ),
  ul: (props: any) => (
    <ul className="list-disc list-inside space-y-2 mb-6 text-base sm:text-lg text-foreground/80" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal list-inside space-y-2 mb-6 text-base sm:text-lg text-foreground/80" {...props} />
  ),
  li: (props: any) => (
    <li className="ml-4" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-primary/50 pl-4 sm:pl-6 py-1 my-6 italic text-foreground/70 bg-primary/5 rounded-r-theme" {...props} />
  ),
  code: (props: any) => (
    <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-theme overflow-x-auto mb-6 text-sm font-mono shadow-sm" {...props} />
  ),
  img: (props: any) => (
    <span className="block relative w-full aspect-video my-8 rounded-theme overflow-hidden shadow-theme">
      <Image src={props.src} alt={props.alt || ""} fill className="object-cover" />
    </span>
  ),
  hr: (props: any) => <hr className="my-10 border-gray-200" {...props} />,
};
