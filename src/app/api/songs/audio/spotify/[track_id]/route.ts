import { download } from "@/lib/api/spotify/api";
import { makeErrorResponse } from "@/lib/responses";
import { NextResponse } from "next/server";

export async function GET(
  _: any,
  { params: { track_id } }: { params: { track_id: string } }
) {
  const res = await download(track_id);
  if (!res)
    return makeErrorResponse("notfound", "could not find spotify track");

  return new NextResponse(res, {
    headers: {
      "content-type": "audio/mpeg",
      "content-length": Buffer.byteLength(res).toString(),
    },
  });
}
