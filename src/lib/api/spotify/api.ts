import { agent, getAccessToken, getClientToken } from "./authorization";
import {
  SpotifyApiErrorResponse,
  SpotifyApiSearchResponse,
  SpotifyApiSearchType,
  TrackObject,
} from "./types";

const caching = {
  tracks: {} as Record<string, TrackObject>,
};

export async function search<Type extends SpotifyApiSearchType>(
  query: string,
  type: Type,
  limit: number
): Promise<SpotifyApiSearchResponse<Type> | SpotifyApiErrorResponse> {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("type", type);
  params.set("limit", limit.toString());

  const res = await (
    await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: {
        "User-Agent": agent,
        Authorization: `Bearer ${await getAccessToken()}`,
      },
    })
  ).json();

  if ("tracks" in res)
    for (const x of res.tracks.items) caching.tracks[x.id] = x;

  return res;
}

export async function getTrack(
  track_id: string
): Promise<TrackObject | undefined> {
  if (caching.tracks[track_id]) return caching.tracks[track_id];

  const res = await (
    await fetch(`https://api.spotify.com/v1/tracks?ids=${track_id}&market=CZ`, {
      headers: {
        "User-Agent": agent,
        Authorization: `Bearer ${await getAccessToken()}`,
      },
    })
  ).json();

  if (!("error" in res) && res.tracks[0])
    caching.tracks[track_id] = res.tracks[0];

  return res?.tracks[0] ?? res;
}

export async function download(id: string): Promise<Buffer | false> {
  const rep = await (
    await fetch(`https://api.spotifydown.com/download/${id}`, {
      cache: "no-store",
      headers: {
        "User-Agent": agent,
        Referer: "https://spotifydown.com",
        Origin: "https://spotifydown.com",
      },
    })
  ).json();

  if (!rep.success) return false;
  else return Buffer.from(await (await fetch(rep.link)).arrayBuffer());
}
