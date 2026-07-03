import { MediaTracker } from "@/components/MediaTracker";
import { Playlists } from "@/components/Playlists";

export default function MediaPage() {
  return (
    <div className="max-w-6xl mx-auto w-full space-y-24">
      <MediaTracker />
      <Playlists />
    </div>
  );
}
