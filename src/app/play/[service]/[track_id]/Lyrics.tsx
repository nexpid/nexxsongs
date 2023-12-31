/* eslint-disable react-hooks/exhaustive-deps */
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import styles from "./Lyrics.module.css";
import { HasSongLyrics, SongLyric, SongLyricWord } from "@/lib/types";
//@ts-ignore shut up about type definitions!!
import * as Spline from "cubic-spline";

const syncOffset = -150;
const timify = (n: number) => (n + syncOffset) / 1000;

const isLyricActive = (
  audio: HTMLAudioElement | undefined,
  lyric: SongLyric,
  over?: boolean
) => {
  if (!audio) return false;

  const time = audio.currentTime;

  const lineEnd = lyric.endsAt ? timify(lyric.endsAt) : audio.duration;
  const wordEnd =
    lyric.sync === "words"
      ? Math.max(...lyric.words.map((x) => timify(x.endsAt)))
      : 0;
  const subEnd = lyric.sub
    ? Math.max(...lyric.sub.map((x) => timify(x.endsAt)))
    : 0;

  const end = Math.max(lineEnd, wordEnd, subEnd);

  if (over) return time >= end;
  else return time >= timify(lyric.startAt) && time < end;
};

const lineGlowSpline = new Spline([0, 0.5, 0.925, 1], [0, 1, 1, 0]);
const syllableScaleRange = new Spline([0, 0.7, 1], [0.95, 1.025, 1]);
const syllableYOffsetRange = new Spline([0, 0.9, 1], [1 / 100, -(1 / 60), 0]);
const syllableGlowSpline = new Spline([0, 0.15, 0.6, 1], [0, 1, 1, 0]);

const Lyric = ({
  time,
  line,
  words,
  audio,
}: {
  time: number;
  line?: SongLyric;
  words?: SongLyricWord[];
  audio?: HTMLAudioElement;
}) => {
  if (!line && !words) return <></>;

  if (line?.sync === "line") {
    const values = {
      shadowBlur: 0,
      shadowOpacity: 0,
      gradientProgress: 0,
    };

    const ends = line.endsAt ? timify(line.endsAt) : audio?.duration;

    if (ends && ends !== 0) {
      const duration = ends - timify(line.startAt);
      const progress = Math.max(
        Math.min((time - timify(line.startAt)) / duration, 1),
        0
      );

      const alpha = lineGlowSpline.at(progress);
      values.shadowBlur = 4 + 8 * alpha;
      values.shadowOpacity = alpha * 50;
      values.gradientProgress = 120 * progress;
    }

    return (
      <span
        className={styles.lyric}
        style={{
          "--l-text-shadow-blur": `${values.shadowBlur}px`,
          "--l-text-shadow-opacity": `${values.shadowOpacity}%`,
          "--l-gradient-progress": `${values.gradientProgress}%`,
        }}
      >
        {line.text}
      </span>
    );
  } else if (words) {
    return words.map((w, i) => {
      const duration = timify(w.endsAt) - timify(w.startAt);
      const progress = Math.max(
        Math.min((time - timify(w.startAt)) / duration, 1),
        0
      );

      const alpha = syllableGlowSpline.at(progress);

      const values = {
        shadowBlur: 4 + 2 * alpha * 1,
        shadowOpacity: alpha * 35,
        gradientProgress: -20 + 120 * progress,
        scale: syllableScaleRange.at(progress),
        yOffset: syllableYOffsetRange.at(progress),
      };

      return (
        <span
          className={styles.syllable}
          style={{
            "--l-text-shadow-blur": `${values.shadowBlur}px`,
            "--l-text-shadow-opacity": `${values.shadowOpacity}%`,
            "--l-gradient-progress": `${values.gradientProgress}%`,
            "--l-scale": values.scale,
            "--l-y-offset": values.yOffset,
          }}
          key={i}
        >
          {w.word}
        </span>
      );
    });
  }
};

const vocalProps = {
  normal: {
    idle: "opacity-[.51]",
    active: `opacity-100 ${styles.vocal_active}`,
    sung: "opacity-[.497]",
  },
  sub: {
    idle: "opacity-[.27]",
    active: `opacity-80 ${styles.vocal_active}`,
    sung: "opacity-[.33]",
  },
};

const VocalGroup = ({
  audio,
  time,
  line,
  handleRef,
  otherAgents,
}: {
  audio?: HTMLAudioElement;
  time: number;
  line: SongLyric;
  lyrics: HasSongLyrics;
  activeLines?: SongLyric[];
  lastKnownActiveLine?: SongLyric;
  handleRef: (x: HTMLButtonElement) => any;
  otherAgents: boolean;
}) => {
  // const distIndex = 0;
  // const distSize = [0, 1.25, 2.5, 3.75][distIndex] ?? 5;

  const isActive = isLyricActive(audio, line),
    sung = isLyricActive(audio, line, true);

  const status = isActive ? "active" : sung ? "sung" : "idle";

  const w = otherAgents ? "w-8/12" : "w-11/12";

  return (
    <button
      className={`flex flex-col mt-4 mb-4 ${
        line.agent === "right" ? "items-end" : "items-start"
      } ${styles.vocal_group}`}
      onClick={() => {
        if (!audio) return;
        audio.currentTime = (line.startAt + 1) / 1000;
        audio.play();
      }}
      ref={handleRef}
    >
      <div
        className={`flex flex-row flex-wrap ${w} text-5xl font-bold ${
          line.agent === "right"
            ? "justify-end text-right"
            : "justify-start text-left"
        } ${vocalProps.normal[status]} ${styles.vocal}`}
      >
        <Lyric
          time={time}
          line={line.sync === "line" ? line : undefined}
          words={line.sync === "words" ? line.words : undefined}
          audio={audio}
        />
      </div>
      {line.sub && (
        <div
          className={`flex flex-row flex-wrap ${w} text-4xl font-medium ${
            line.agent === "right"
              ? "justify-end text-right"
              : "justify-start text-left"
          } ${vocalProps.sub[status]} ${styles.vocal} ${styles.vocal_sub}`}
        >
          <Lyric time={time} words={line.sub} audio={audio} />
        </div>
      )}
    </button>
  );
};

export default function Lyrics({
  lyrics,
  audio,
}: {
  lyrics: HasSongLyrics;
  audio?: HTMLAudioElement;
}) {
  const [_, forceUpdate] = useReducer((x) => ~x, 0);
  const [giveup, setGiveup] = useState(false);

  const time = audio?.currentTime ?? 0;

  const activeLines = useMemo(() => {
    return lyrics.lines.filter((x) => isLyricActive(audio, x));
  }, [time]);

  const scrollerRef = useRef<HTMLDivElement>();
  const lineRefs: HTMLButtonElement[] = useRef([]).current;
  useLayoutEffect(() => {
    const indexes = lyrics.lines
      .map((_, i) => i)
      .filter((i) => activeLines.includes(lyrics.lines[i]))
      .map((i) => lineRefs[i]);
    if (!indexes[0]) return;

    const pos = indexes.map((x) => x.offsetTop - window.screen.height / 2.5);

    scrollerRef.current?.scrollTo({
      top: pos.reduce((x, y) => x + y, 0) / pos.length,
      behavior: "smooth",
    });
  }, [JSON.stringify(activeLines)]);

  if (!giveup && typeof window !== "undefined")
    window.requestAnimationFrame(forceUpdate);
  useEffect(
    () => window.addEventListener("beforeunload", () => setGiveup(true)),
    []
  );

  const otherAgents = lyrics.lines.some((x) => x.agent !== "left");

  return (
    <div
      className="absolute w-full h-full overflow-y-scroll flex flex-col pl-[17.5cqw] pr-[15cqw]"
      ref={(x: HTMLDivElement) => (scrollerRef.current = x)}
    >
      <div className="pt-64" />
      <h2 className="text-2xl mb-5 opacity-50 text-left select-none">
        Lyrics provided by{" "}
        {lyrics.source === "spotify"
          ? "Spotify"
          : lyrics.source === "apple-music"
          ? "Apple Music"
          : "Unknown source"}
      </h2>
      {lyrics.lines.map((x, i) => (
        <VocalGroup
          key={i}
          audio={audio}
          time={time}
          line={x}
          lyrics={lyrics}
          handleRef={(y) => (lineRefs[i] = y)}
          otherAgents={otherAgents}
        />
      ))}
      <div className="pt-32" />
    </div>
  );
}
