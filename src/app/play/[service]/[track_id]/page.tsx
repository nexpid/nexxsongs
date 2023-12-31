import Unknown from "@/components/Unknown";
import { api } from "@/lib/api/base";
import { ErrorResponse } from "@/lib/responses";
import { SongInfo } from "@/lib/types";
import Main from "./Main";
import { Metadata } from "next";

export type Service = "spotify";

const getSongInfo = async (
  service: Service,
  track_id: string
): Promise<SongInfo | string> => {
  const data = await fetch(`${api}songs/info/${service}/${track_id}`);

  try {
    const json = (await data.json()) as ErrorResponse | SongInfo;
    if ("error" in json) return `${json.status}: ${json.error}`;
    else return json;
  } catch {
    return "Could not parse API response";
  }
};

export async function generateMetadata({
  params,
}: {
  params: { service: Service; track_id: string };
}): Promise<Metadata> {
  const songInfo = await getSongInfo(params.service, params.track_id);

  if (typeof songInfo === "string")
    return {
      title: "Unknown song",
    };
  else
    return {
      title: songInfo.name,
    };
}

export default async function Page({
  params,
}: {
  params: { service: Service; track_id: string };
}) {
  if (params.service !== "spotify" && params.service !== "youtube")
    return (
      <Unknown
        label="Unknown service"
        subLabel={`"${params.service}" is not a valid service (can only be youtube or spotify)`}
      />
    );

  const songInfo = await getSongInfo(params.service, params.track_id);
  if (typeof songInfo === "string")
    return <Unknown label="Unknown song" subLabel={songInfo} />;

  return <Main service={params.service} song={songInfo} />;
}
