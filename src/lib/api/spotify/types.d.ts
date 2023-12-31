export interface SpotifyApiAccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}
export interface SpotifyApiRefreshTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
}

export type SpotifyApiSearchType =
  | "album"
  | "artist"
  | "playlist"
  | "track"
  | "show"
  | "episode"
  | "audiobooks";

export interface ImageObject {
  url: string;
  height: number | null;
  width: number | null;
}

export interface ArtistObject {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: null;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

export interface SimplifiedAlbumObject {
  album_type: string[];
  total_tracks: number;
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  restrictions?: {
    reason?: "market" | "product" | "explicit";
  };
  type: string;
  uri: string;
  artists: ArtistObject[];
}

export interface TrackObject {
  album: SimplifiedAlbumObject;
  artists: ArtistObject[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_playable?: boolean;
  linked_from?: {};
  restrictions?: {
    reason?: "market" | "product" | "explicit";
  };
  name: string;
  popularity: number;
  preview_url: number | null;
  track_number: number;
  type: "string";
  uri: string;
  is_local: boolean;
}

export type SpotifyApiSearchResponse<Type extends SpotifyApiSearchType> =
  Record<
    `${Type}s`,
    {
      href: string;
      limit: number;
      next: string | null;
      offset: number;
      previous: string | null;
      total: number;
      items: (Type extends "track"
        ? TrackObject
        : Type extends "album"
        ? SimplifiedAlbumObject
        : Type extends "artist"
        ? ArtistObject
        : never)[];
    }
  >;

export interface SpotifyApiErrorResponse {
  error: {
    status: number;
    message: string;
  };
}
