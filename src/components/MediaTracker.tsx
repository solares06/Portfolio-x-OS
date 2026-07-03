"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Zap } from "lucide-react";

type TabType = "Watched" | "Watching/Reading" | "Watchlist";

interface MediaItem {
  id: string;
  title: string;
  creator: string;
  type: "Movie" | "Book" | "Show";
  status: TabType;
  rating?: number;
  progress?: string;
  progressPercent?: number;
  coverImage: string;
  year?: string;
}

const mockMedia: MediaItem[] = [
  // Currently Consuming
  {
    id: "1",
    title: "The Architecture of Happiness",
    creator: "Alain de Botton",
    type: "Book",
    status: "Watching/Reading",
    progress: "64%",
    progressPercent: 64,
    coverImage: "https://picsum.photos/seed/book1/400/600",
  },
  {
    id: "2",
    title: "Severance (Season 2)",
    creator: "Apple TV+",
    type: "Show",
    status: "Watching/Reading",
    progress: "Ep 3 / 10",
    progressPercent: 30,
    coverImage: "https://picsum.photos/seed/show1/400/600",
  },
  
  // Watched / Read
  {
    id: "3",
    title: "Dune: Part Two",
    creator: "Denis Villeneuve",
    type: "Movie",
    status: "Watched",
    rating: 4.5,
    year: "2024",
    coverImage: "https://picsum.photos/seed/movie1/400/600",
  },
  {
    id: "4",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    creator: "Gabrielle Zevin",
    type: "Book",
    status: "Watched",
    rating: 5.0,
    year: "2022",
    coverImage: "https://picsum.photos/seed/book2/400/600",
  },
  {
    id: "5",
    title: "Succession",
    creator: "HBO",
    type: "Show",
    status: "Watched",
    rating: 4.9,
    year: "2023",
    coverImage: "https://picsum.photos/seed/show2/400/600",
  },
  {
    id: "6",
    title: "Perfect Days",
    creator: "Wim Wenders",
    type: "Movie",
    status: "Watched",
    rating: 4.5,
    year: "2023",
    coverImage: "https://picsum.photos/seed/movie2/400/600",
  },
  {
    id: "7",
    title: "The Creative Act",
    creator: "Rick Rubin",
    type: "Book",
    status: "Watched",
    rating: 5.0,
    year: "2023",
    coverImage: "https://picsum.photos/seed/book3/400/600",
  },

  // Watchlist
  {
    id: "8",
    title: "Megalopolis",
    creator: "Francis Ford Coppola",
    type: "Movie",
    status: "Watchlist",
    year: "2024",
    coverImage: "https://picsum.photos/seed/movie3/400/600",
  },
  {
    id: "9",
    title: "The Sympathizer",
    creator: "HBO",
    type: "Show",
    status: "Watchlist",
    year: "2024",
    coverImage: "https://picsum.photos/seed/show3/400/600",
  },
  {
    id: "10",
    title: "Neuromancer",
    creator: "William Gibson",
    type: "Book",
    status: "Watchlist",
    year: "1984",
    coverImage: "https://picsum.photos/seed/book4/400/600",
  }
];

const spotifyCurations = [
  { id: "s1", title: "Ambient Focus", desc: "Deep textures for deep work", img: "https://picsum.photos/seed/spot1/400/400" },
  { id: "s2", title: "Late Night Jazz", desc: "A collection of modern classics", img: "https://picsum.photos/seed/spot2/400/400" },
  { id: "s3", title: "Indie Folk", desc: "Acoustic warmth for rainy days", img: "https://picsum.photos/seed/spot3/400/400" }
];

const visualSets = [
  { id: "v1", img: "https://picsum.photos/seed/vis1/400/400" },
  { id: "v2", img: "https://picsum.photos/seed/vis2/400/400" },
  { id: "v3", img: "https://picsum.photos/seed/vis3/400/400" },
  { id: "v4", img: "https://picsum.photos/seed/vis4/400/400" }
];

export function MediaTracker() {
  const [activeTab, setActiveTab] = useState<TabType>("Watched");

  const currentlyConsuming = mockMedia.filter(m => m.status === "Watching/Reading");
  const filteredMedia = mockMedia.filter(m => m.status === activeTab);

  return (
    <div className="space-y-24 pb-12">
      {/* Header Section */}
      <section className="space-y-4">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Media Log
        </h1>
        <p className="max-w-2xl text-lg text-foreground/80 leading-relaxed">
          A curated collection of things I&apos;ve read, watched, and enjoyed recently. A 
          personal archive of consumption and reflection.
        </p>
      </section>

      {/* Currently Consuming */}
      {currentlyConsuming.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-foreground">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-bold">Currently Consuming</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentlyConsuming.map((item) => (
              <div key={item.id} className="flex items-center space-x-6 p-6 bg-card border border-card-border rounded-theme shadow-theme">
                <div className="relative w-24 h-36 shrink-0 rounded-md overflow-hidden shadow-sm">
                  <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      {item.status === "Watching/Reading" ? (item.type === "Book" ? "READING" : "WATCHING") : item.status}
                    </p>
                    <h3 className="font-display text-lg font-bold leading-tight">{item.title}</h3>
                    <p className="text-sm text-foreground/60 mt-1">{item.creator}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${item.progressPercent || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-foreground/50 font-medium">
                      {item.progress}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tabs and Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-px overflow-x-auto">
          <div className="flex space-x-8 min-w-max">
            {(["Watched", "Watching/Reading", "Watchlist"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold uppercase tracking-wider transition-colors relative ${
                  activeTab === tab ? "text-primary" : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMedia.map((item) => (
            <div key={item.id} className="group flex flex-col space-y-3">
              <div className="relative aspect-[2/3] w-full rounded-theme overflow-hidden shadow-theme bg-gray-100 border border-card-border">
                <Image 
                  src={item.coverImage} 
                  alt={item.title} 
                  fill 
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                {item.rating && (
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold flex items-center shadow-sm text-gray-800">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                    {item.rating}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-foreground/60 mt-1 line-clamp-1">
                  {item.type} {item.year ? `• ${item.year}` : ""} • {item.creator}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {filteredMedia.length === 0 && (
          <div className="py-12 text-center text-foreground/50 text-sm">
            No media found for this category.
          </div>
        )}
      </section>

      {/* Spotify Curations */}
      <section className="space-y-6 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Spotify Curations</h2>
          <a href="#" className="text-xs font-semibold text-primary uppercase tracking-wider hover:underline">
            View Profile
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {spotifyCurations.map((playlist) => (
            <div key={playlist.id} className="group space-y-3">
              <div className="relative aspect-square w-full rounded-theme overflow-hidden shadow-theme bg-gray-100 border border-card-border">
                <Image 
                  src={playlist.img} 
                  alt={playlist.title} 
                  fill 
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm">{playlist.title}</h3>
                <p className="text-xs text-foreground/60 mt-1">{playlist.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Sets */}
      <section className="space-y-6 pt-8 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Visual Sets</h2>
          <span className="text-xs text-foreground/50">Curated imagery and moodboards</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {visualSets.map((set) => (
            <div key={set.id} className="relative aspect-square w-full rounded-theme overflow-hidden shadow-theme bg-gray-100 border border-card-border hover:opacity-90 transition-opacity cursor-pointer">
              <Image 
                src={set.img} 
                alt={`Visual Set ${set.id}`} 
                fill 
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover" 
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
