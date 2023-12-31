/* eslint-disable react-hooks/exhaustive-deps */
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/scn/ui/avatar";
import { SongInfo } from "@/lib/types";
import { coverAlt, timeToReadable } from "@/lib/util";
import playLight from "@/../public/play-light.svg";
import pauseLight from "@/../public/pause-light.svg";
import Image from "next/image";
import styles from "./Audio.module.css";
import { useEffect, useReducer, useRef, useState } from "react";

const clean = (x: number) => Math.floor(x);

const TimeProgress = ({
  time,
  audio,
}: {
  time: number;
  audio: HTMLAudioElement;
}) => {
  const [previewProgress, setPreviewProgress] = useState(0);
  const [isClicking, setIsClicking] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>();

  const getProgress = (ev: MouseEvent) => {
    const btnPos = buttonRef.current!.getClientRects()[0];
    const dist = ev.clientX - btnPos.x;
    const perc = Math.max(Math.min(dist / btnPos.width, 1), 0);
    return perc;
  };

  useEffect(() => {
    if (!isClicking) return;

    const moveHandler = (ev: MouseEvent) => setPreviewProgress(getProgress(ev));
    const upHandler = (ev: MouseEvent) => {
      setIsClicking(false);
      setPreviewProgress(0);
      if (!Number.isFinite(audio.duration)) return;
      audio.currentTime = getProgress(ev) * audio.duration;
    };

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler);
    return () => {
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseup", upHandler);
    };
  }, [isClicking]);

  return (
    <button
      className="w-1/3 h-2 bg-slate-800 rounded-full"
      onMouseDown={(ev: any) => {
        setIsClicking(true);
        setPreviewProgress(getProgress(ev));
      }}
      ref={(x: HTMLButtonElement) => (buttonRef.current = x)}
    >
      <div
        className="h-full bg-slate-100 rounded-full"
        style={{
          width: `${
            previewProgress && isClicking
              ? Math.floor(previewProgress * 100)
              : Number.isFinite(audio.duration)
              ? Math.floor((time / clean(audio.duration)) * 100)
              : 0
          }%`,
        }}
      />
    </button>
  );
};

export default function AudioComponent({
  song,
  audio,
}: {
  song: SongInfo;
  audio?: HTMLAudioElement;
}) {
  const [_, forceUpdate] = useReducer((x) => ~x, 0);
  const [giveup, setGiveup] = useState(false);

  const time = audio?.currentTime ?? 0,
    playback = audio ? !audio.paused : false;

  useEffect(() => {
    const keyHandler = (ev: KeyboardEvent) => {
      const prevent = [
        "Space",
        "KeyK",
        "ArrowLeft",
        "KeyJ",
        "ArrowRight",
        "KeyL",
      ];
      if (prevent.includes(ev.code)) ev.preventDefault();
      if (ev.repeat || !audio) return;

      if (ev.code === "Space" || ev.code === "KeyK")
        audio?.paused ? audio.play() : audio.pause();
      else if (ev.code === "ArrowLeft" || ev.code === "KeyJ")
        audio.currentTime -= ev.code === "KeyJ" ? 10 : 3;
      else if (ev.code === "ArrowRight" || ev.code === "KeyL")
        audio.currentTime += ev.code === "KeyL" ? 10 : 3;
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [audio]);

  if (!giveup && typeof window !== "undefined")
    window.requestAnimationFrame(forceUpdate);
  if (giveup) audio?.pause();
  useEffect(
    () => window.addEventListener("beforeunload", () => setGiveup(true)),
    []
  );

  return (
    <div
      className={`absolute left-1/2 ${
        audio ? "bottom-4" : "-bottom-24"
      } -translate-x-1/2 w-[75rem] max-w-[95%] h-24 rounded-md bg-slate-700 ${
        styles.container
      }`}
    >
      <div className="flex flex-row gap-3 p-2 items-center">
        <Avatar className="w-20 h-20 rounded-md">
          <AvatarImage src={song.cover} alt={coverAlt(song)} />
          <AvatarFallback>
            {song.name
              .split(/ +/g)
              .filter((x) => x.match(/^[a-z0-9]/i))
              .map((x) => x[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-center">
          <h1 className="font-bold text-lg">{song.name}</h1>
          <h2 className="opacity-75 text-md">
            {song.explicit && (
              <span className="bg-slate-600 font-semibold pt-1 pb-1 pl-2 pr-2 mr-1 rounded-lg">
                E
              </span>
            )}
            {song.authors.join(", ")}
          </h2>
        </div>
        {audio && (
          <div className="absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center gap-2">
            <button
              onClick={() => (playback ? audio.pause() : audio.play())}
              onKeyDown={(ev) => ev.preventDefault()}
            >
              <Image
                src={playback ? pauseLight : playLight}
                alt={playback ? "Pause song" : "Play song"}
                width={35}
                height={35}
              />
            </button>
            <div className="w-full flex flex-row justify-center items-center gap-2">
              <p className="w-9">{timeToReadable(time)}</p>
              <TimeProgress time={time} audio={audio} />
              <p className="w-9">
                {timeToReadable(
                  Number.isFinite(audio.duration) ? audio.duration : 0
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
