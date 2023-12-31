import iconDark from "@/../public/icon-dark.svg";
import iconLight from "@/../public/icon-light.svg";

import Search from "@/components/Search";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <>
      <div className="h-fit flex flex-row gap-2">
        <Image
          src={iconDark}
          className="block dark:hidden"
          loading="eager"
          alt="NexxSongs Icon"
          height={200}
        />
        <Image
          src={iconLight}
          className="hidden dark:block"
          loading="eager"
          alt="NexxSongs Icon"
          height={200}
        />
        <div className="flex flex-col justify-center">
          <h1 className="font-bold text-6xl">NexxSongs</h1>
          <h2 className="opacity-75 text-2xl">
            Look up song metadata and lyrics with ease
          </h2>
        </div>
      </div>
      <Search />
    </>
  );
}
