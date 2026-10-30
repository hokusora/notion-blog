import { useContext } from "react";
import { AudioPlaylistContext } from "./audioPlaylistContextDef";

export function useAudioPlaylist() {
  const context = useContext(AudioPlaylistContext);
  if (!context) {
    throw new Error("useAudioPlaylist must be used within an AudioPlaylistProvider");
  }
  return context;
}
