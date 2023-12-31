import { SongInfo } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "./scn/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "./scn/ui/avatar";
import { coverAlt } from "@/lib/util";
import Image from "next/image";
import playLight from "@/../public/play-light.svg";

export default function Song({ data }: { data?: SongInfo }) {
  return (
    <div className="w-[32rem] max-w-[90%] h-24 rounded-md bg-slate-200 dark:bg-slate-700">
      {data ? (
        <div className="flex flex-row gap-3 p-2 items-center">
          <Avatar className="w-20 h-20 rounded-md">
            <AvatarImage src={data.cover} alt={coverAlt(data)} />
            <AvatarFallback>
              {data.name
                .split(/ +/g)
                .filter((x) => x.match(/^[a-z0-9]/i))
                .map((x) => x[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-[65%] flex flex-col justify-center">
            <h1 className="font-bold text-lg">{data.name}</h1>
            <h2 className="opacity-75 text-md">
              {data.explicit && (
                <span className="bg-slate-300 dark:bg-slate-600 font-semibold pt-1 pb-1 pl-2 pr-2 mr-1 rounded-lg">
                  E
                </span>
              )}
              {data.authors.join(", ")}
            </h2>
          </div>
          <div className="w-full h-full flex flex-row-reverse items-center pr-2">
            <Link
              href={{
                pathname: `/play/${data.type}/${data.id}`,
              }}
            >
              <Image src={playLight} alt="Play icon" width={35} height={35} />
            </Link>
          </div>
        </div>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
}
