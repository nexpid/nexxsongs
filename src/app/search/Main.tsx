/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Divider from "@/components/Divider";
import Search from "@/components/Search";
import Song from "@/components/Song";
import useLazyAPI from "@/components/hooks/useLazyAPI";
import { SongInfo } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Main({ query }: { query?: string }) {
  const router = useRouter();
  if (!query) {
    router.push("/");
    return null;
  }

  const results = useLazyAPI<SongInfo[]>(
    `/api/search?q=${encodeURIComponent(query ?? "")}`,
    undefined
  );

  return (
    <div className="contents gap-5">
      <Search value={query} />
      <Divider />
      {results ? results.map((x) => <Song key={x.id} data={x} />) : <Song />}
    </div>
  );
}
