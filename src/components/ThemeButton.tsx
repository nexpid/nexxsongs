"use client";

import moonDark from "@/../public/moon-dark.svg";
import sunLight from "@/../public/sun-light.svg";

import Image from "next/image";
import { useState, useLayoutEffect } from "react";

const isMediaDark = () =>
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;

export default function ThemeButton() {
  const storageTheme =
    typeof window !== "undefined" ? localStorage.getItem("theme") : undefined;
  const [theme, setTheme] = useState(
    storageTheme === "dark" || storageTheme === "light"
      ? storageTheme
      : isMediaDark()
      ? "dark"
      : "light"
  );

  useLayoutEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("theme", theme);
    if (theme === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [theme]);

  return (
    <button
      className="absolute right-3 top-3 w-fit h-fit bg-slate-300 dark:bg-slate-700 rounded-full p-2"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Image
        src={moonDark}
        className="block dark:hidden"
        loading="lazy"
        alt="Moon icon"
        width={40}
      />
      <Image
        src={sunLight}
        className="hidden dark:block"
        loading="lazy"
        alt="Sun icon"
        width={40}
      />
    </button>
  );
}
