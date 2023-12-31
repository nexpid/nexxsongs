import { getTrack } from "@/lib/api/spotify/api";
import { makeErrorResponse } from "@/lib/responses";
import { trackToSongInfo } from "@/lib/util";
import { NextResponse } from "next/server";

export async function GET(
  _: any,
  { params }: { params: { track_id: string } }
) {
  const track = await getTrack(params.track_id);
  if (!track)
    return makeErrorResponse("badrequest", `nonexistent spotify track`);

  return NextResponse.json(trackToSongInfo(track));
}
