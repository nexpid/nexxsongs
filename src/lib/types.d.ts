export interface SongInfo {
  type: "spotify" | "youtube";
  id: string;
  name: string;
  authors: string[];
  cover: string;
  links: {
    external: string;
    lyrics: string | null;
    audio: string | null;
  };
  explicit: boolean;
}

interface SongLyricWord {
  startAt: number;
  endsAt: number;
  word: string;
}

export type SongLyric = {
  startAt: number;
  endsAt: number | null;
  sub?: SongLyricWord[];
  agent: "left" | "right";
} & (
  | {
      sync: "line";
      text: string;
    }
  | {
      sync: "words";
      words: SongLyricWord[];
    }
);

export type HasSongLyrics = {
  has: true;
  source: "spotify" | "apple-music";
  lines: SongLyric[];
  startAt: number;
};
export type SongLyrics =
  | {
      has: false;
    }
  | HasSongLyrics;
