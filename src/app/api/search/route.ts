import { search } from "@/lib/api/spotify/api";
import { makeErrorResponse } from "@/lib/responses";
import { SongInfo } from "@/lib/types";
import { trackToSongInfo } from "@/lib/util";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const query = params.get("q");
  if (!query)
    return makeErrorResponse("badrequest", "missing query search param");

  const results: SongInfo[] = [];

  const res = await search(query, "track", 10);
  if ("error" in res)
    return makeErrorResponse(
      "servererror",
      `spotify: ${res.error.status}: ${res.error.message}`
    );

  const track = res.tracks.items[0];
  if (track) results.push(trackToSongInfo(track));

  return NextResponse.json(results);
}
