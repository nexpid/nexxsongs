import { TrackObject } from "./api/spotify/types";
import { SongInfo } from "./types";

export function pickTrackCover(track: TrackObject) {
  return track.album.images[0].url;
}

export function trackToSongInfo(track: TrackObject): SongInfo {
  return {
    type: "spotify",
    id: track.id,
    name: track.name,
    authors: track.artists.map((x) => x.name),
    cover: pickTrackCover(track),
    links: {
      external: track.external_urls.spotify,
      lyrics: null,
      audio: `/api/songs/audio/spotify/${track.id}`,
    },
    explicit: track.explicit,
  };
}

export function coverAlt(song: SongInfo) {
  return `Cover of ${song.type} song ${song.name} by ${song.authors.join(
    ", "
  )}`;
}

type SearchTree = Record<string, any>;
type SearchFilter = (tree: SearchTree) => boolean;

const treeSearch = (
  tree: SearchTree,
  filter: SearchFilter,
  maxDepth: number,
  depth: number
): any => {
  if (depth > maxDepth) return;
  if (!tree) return;

  try {
    if (filter(tree)) return tree;
  } catch {}

  if (Array.isArray(tree)) {
    for (const item of tree) {
      if (typeof item !== "object" || item === null) continue;

      try {
        const found = treeSearch(item, filter, maxDepth, depth + 1);
        if (found) return found;
      } catch {}
    }
  } else if (typeof tree === "object") {
    for (const key of Object.keys(tree)) {
      if (typeof tree[key] !== "object" || tree[key] === null) continue;

      try {
        const found = treeSearch(tree[key], filter, maxDepth, depth + 1);
        if (found) return found;
      } catch {}
    }
  }
};

export function findInTree(
  object: any,
  filter: SearchFilter,
  maxDepth: number = 100
): any {
  return treeSearch(object, filter, maxDepth, 0);
}

export function stringTimeToMs(time: string) {
  const data = time.split(":").reverse();

  const s = Number(data[0].split(".")[0]);
  const ms = Number(data[0].split(".")[1]);

  return (
    ms +
    s * 1000 +
    Number(data[1] ?? "0") * 60 * 1000 +
    Number(data[2] ?? "0") * 60 * 60 * 1000
  );
}

export function timeToReadable(time: number) {
  return `${Math.floor(time / 60)}:${Math.floor(time % 60)
    .toString()
    .padStart(2, "0")}`;
}
