"use client";

import Unknown from "@/components/Unknown";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404",
};

export default function Custom404() {
  return <Unknown label="404" subLabel="The requested path was not found" />;
}
