import { Music, Play } from "lucide-react";

interface PlaylistConfig {
  spotifyPlaylistId: string;
  youtubePlaylistId: string;
}

const defaultConfig: PlaylistConfig = {
  spotifyPlaylistId: "37i9dQZF1DX5trt9i14X7j",
  youtubePlaylistId: "PLDoPjvoNmBAy532K9M_fjiAmrJ0gkCyLJ",
};

export function Playlists({
  spotifyPlaylistId = defaultConfig.spotifyPlaylistId,
  youtubePlaylistId = defaultConfig.youtubePlaylistId,
}: Partial<PlaylistConfig> = {}) {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          Playlists
        </h2>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
          What I&apos;m listening to &amp; watching
        </p>
      </div>

      {/* Embeds Grid — side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spotify Embed */}
        <div className="bg-card rounded-theme shadow-theme border border-card-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
            <Music className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
              Spotify
            </span>
          </div>
          <iframe
            title="Spotify Playlist"
            src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}?utm_source=generator&theme=0`}
            width="100%"
            height="452"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-0"
          />
        </div>

        {/* YouTube Embed */}
        <div className="bg-card rounded-theme shadow-theme border border-card-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
              YouTube
            </span>
          </div>
          <div className="relative w-full" style={{ height: "452px" }}>
            <iframe
              title="YouTube Playlist"
              src={`https://www.youtube.com/embed/videoseries?list=${youtubePlaylistId}`}
              width="100%"
              height="100%"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="border-0 absolute inset-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
