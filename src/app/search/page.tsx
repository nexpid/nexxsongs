import { Metadata } from "next";
import Main from "./Main";

export const metadata: Metadata = {
  title: "Search",
};

export default function SearchPage({
  searchParams: { q: query },
}: {
  searchParams: { q?: string };
}) {
  return <Main query={query} />;
}
