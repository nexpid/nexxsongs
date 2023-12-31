"use client";

import Image from "next/image";
import { Service } from "./page";
import { SongInfo, SongLyrics } from "@/lib/types";
import { coverAlt } from "@/lib/util";
import styles from "./Main.module.css";
import useLazyAPI from "@/components/hooks/useLazyAPI";
import Lyrics from "./Lyrics";
import AudioComponent from "./Audio";

export default function Main({
  service,
  song,
}: {
  service: Service;
  song: SongInfo;
}) {
  const lyricsData = useLazyAPI<SongLyrics>(
    `/api/songs/lyrics/${service}/${song.id}?filter`,
    undefined
  );
  const audio = useLazyAPI(
    `/api/songs/audio/${service}/${song.id}`,
    undefined,
    async (dt) => {
      const aud = new Audio(
        URL.createObjectURL(new Blob([await dt.arrayBuffer()]))
      );
      document.body.appendChild(aud);
      return aud;
    }
  );

  const text = !audio
    ? "Downloading audio..."
    : !lyricsData
    ? "Fetching lyrics..."
    : !lyricsData.has &&
      "You caught us, we're still working on getting lyrics for this one";

  return (
    <div className="absolute w-full h-full overflow-hidden text-slate-200">
      <div className="absolute left-0 top-0 w-full h-full overflow-hidden">
        <div
          className={`overflow-hidden pointer-events-none w-full max-w-[35%] h-full max-h-[55%] origin-top-left saturate-[2.5] brightness-[0.65] ${styles.bg_container}`}
        >
          <Image
            className={styles.bg_center}
            src={song.cover}
            width={20}
            height={20}
            alt={coverAlt(song)}
          />
          <Image
            className={styles.bg_back}
            src={song.cover}
            width={20}
            height={20}
            alt={coverAlt(song)}
          />
          <Image
            className={styles.bg_color}
            src={song.cover}
            width={20}
            height={20}
            alt={coverAlt(song)}
          />
        </div>
      </div>
      {lyricsData?.has && (
        <div
          className={`overflow-hidden absolute w-full min-h-full ${
            text ? "blur-sm" : ""
          } ${styles.transition}`}
        >
          <Lyrics lyrics={lyricsData} audio={audio} />
        </div>
      )}
      {text && (
        <div className="absolute w-full h-full">
          <div className="w-full h-full flex justify-center items-center">
            <h1 className="font-bold items-center justify-center text-5xl">
              {text}
            </h1>
          </div>
        </div>
      )}
      <AudioComponent song={song} audio={audio} />
    </div>
  );
}
