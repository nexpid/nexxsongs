import { root } from "@/lib/api/base";
import { getTrack } from "@/lib/api/spotify/api";
import { makeErrorResponse } from "@/lib/responses";
import { HasSongLyrics } from "@/lib/types";
import { stringTimeToMs } from "@/lib/util";
import { load } from "cheerio";
import { NextResponse } from "next/server";

const filter = (swears: Record<string, string[]>, x: string) =>
  x
    .split(" ")
    .map((y) => {
      const entry = Object.entries(swears).find(([x]) =>
        y.toLowerCase().includes(x.toLowerCase())
      );
      if (entry && entry[1].every((z) => z.toLowerCase() !== y.toLowerCase()))
        return "*".repeat(y.length);
      else return y;
    })
    .join(" ");

export async function GET(
  req: Request,
  { params }: { params: { track_id: string } }
) {
  const { searchParams } = new URL(req.url);
  const track = await getTrack(params.track_id);
  if (!track)
    return makeErrorResponse("badrequest", `nonexistent spotify track`);

  let swears: Record<string, string[]>;
  if (searchParams.get("filter") !== null) {
    const rawSwears = (await (await fetch(`${root}swears.txt`)).text())
      .replace(/\r/g, "")
      .split("\n");

    swears = {};
    for (const s of rawSwears) {
      const [word, ...rawAvoid] = s.split(":");
      const avoid = rawAvoid.join(":").split(",");

      swears[word] = avoid;
    }
  }

  const decide = (x: string) => (swears ? filter(swears, x) : x);

  const code = track.external_ids.isrc;
  if (code) {
    const req = await fetch(
      `https://beautiful-lyrics.socalifornian.live/lyrics/${code}`
    );
    const reqText = await req.text();
    if (req.ok && reqText) {
      const reqJson = JSON.parse(reqText);
      if (reqJson.IsSynced) {
        const data = load(reqJson.Content);

        const res = {
          has: true,
          source: "apple-music",
          lines: [],
          startAt: 0,
        } as HasSongLyrics;

        const div = data("div");
        res.startAt = stringTimeToMs(div.attr("begin")!);

        for (const x of div.children().toArray()) {
          const e = data(x);
          const wordElms = e
            .children("span")
            .toArray()
            .map((x) => data(x));

          const subElm = wordElms
            .find((x) => x.attr("ttm:role") === "x-bg")
            ?.children("span")
            .toArray()
            .map((x) => data(x));
          const sub = subElm?.[0]
            ? subElm.map((x) => ({
                startAt: stringTimeToMs(x.attr("begin")!),
                endsAt: stringTimeToMs(x.attr("end")!),
                word: decide(x.text()),
              }))
            : undefined;

          if (wordElms[0])
            res.lines.push({
              startAt: stringTimeToMs(e.attr("begin")!),
              endsAt: stringTimeToMs(e.attr("end")!),
              sync: "words",
              agent: e.attr("ttm:agent") === "v2" ? "right" : "left",
              words: wordElms
                .filter((x) => x.attr("ttm:role") !== "x-bg")
                .map((x) => ({
                  startAt: stringTimeToMs(x.attr("begin")!),
                  endsAt: stringTimeToMs(x.attr("end")!),
                  word: decide(x.text()),
                })),
              sub,
            });
          else
            res.lines.push({
              startAt: stringTimeToMs(e.attr("begin")!),
              endsAt: stringTimeToMs(e.attr("end")!),
              sync: "line",
              agent: "left",
              text: decide(e.text()),
              sub,
            });
        }

        return NextResponse.json(res);
      }
    }
  }

  const lyrics = await (
    await fetch(
      `https://spotify-lyric-api.herokuapp.com/?trackid=${encodeURIComponent(
        track.id
      )}`
    )
  ).json();

  if (!lyrics || lyrics.error) return NextResponse.json({ has: false });

  const lines: any[] = lyrics.lines;
  const lastLine = lines[lines.length - 1];
  const excludeLastLine = !lastLine.text;

  return NextResponse.json({
    has: true,
    source: "spotify",
    lines: lines
      .filter((x) => (excludeLastLine ? x !== lastLine : true))
      .map((x, i) => ({
        startAt: Number(x.startTimeMs),
        endsAt:
          x.endTimeMs !== "0"
            ? Number(x.endTimeMs)
            : lines[i + 1] === lastLine && excludeLastLine
            ? Number(lastLine.startTimeMs)
            : lines[i + 1]
            ? Number(lines[i + 1].startTimeMs) - 1
            : null,
        sync: "line",
        text: x.words,
      })),
    startAt: Number(lyrics.lines[0].startTimeMs),
  });
}
