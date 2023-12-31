/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

export default function Search({ value }: { value?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>();

  useLayoutEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.value = value ?? "";
  }, []);

  const submit = () => {
    const val = inputRef.current?.value;
    if (val) router.push(`/search?q=${encodeURIComponent(val)}`);
  };

  return (
    <div className="w-[45rem] max-w-[90%] h-fit rounded-lg bg-zinc-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 border-4 p-4 text-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          type="search"
          className="w-full h-full bg-transparent"
          placeholder="Search for a song..."
          maxLength={100}
          ref={(x: HTMLInputElement) => (inputRef.current = x)}
        />
      </form>
    </div>
  );
}
