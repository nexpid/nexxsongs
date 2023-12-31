import { load } from "cheerio";

export const agent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0";

export const access: {
  token?: string;
  clientId?: string;
  deviceId?: string;
  expiresAt: number;
} = {
  expiresAt: -1,
};

export async function getAccessToken(): Promise<string> {
  if (!access.token || access.expiresAt <= Date.now()) {
    const session = load(
      await (
        await fetch("https://open.spotify.com/", {
          cache: "no-store",
          headers: { "User-Agent": agent },
        })
      ).text()
    );

    const rawObject = session("script[id=session]")?.text();
    if (!rawObject) throw new Error("failed to get spotify access token (#1)");

    const rawConfigObject = session("script[id=config]")?.text();
    if (!rawConfigObject)
      throw new Error("failed to get spotify access token (#2)");

    const object = (0, eval)(`(${rawObject})`);
    const configObject = (0, eval)(`(${rawConfigObject})`);

    access.token = object.accessToken;
    access.expiresAt = object.accessTokenExpirationTimestampMs;
    access.clientId = object.clientId;
    access.deviceId = configObject.correlationId;
  }

  return access.token!;
}

const client: {
  token?: string;
  expiresAt: number;
} = {
  expiresAt: -1,
};

export async function getClientToken(): Promise<string> {
  if (!client.token || client.expiresAt <= Date.now()) {
    const script = await (
      await fetch(
        "https://open.spotifycdn.com/cdn/build/web-player/web-player.c2faace9.js",
        {
          cache: "no-store",
          headers: {
            "User-Agent": agent,
          },
        }
      )
    ).text();

    const cversion = script.match(/clientVersion:"([^"]+)"/)?.[1];
    if (!cversion) throw new Error("failed to get spotify client token (#1)");

    const accessToken = await getAccessToken();

    let res = await (
      await fetch("https://clienttoken.spotify.com/v1/clienttoken", {
        cache: "no-store",
        method: "POST",
        headers: {
          "User-Agent": agent,
          Referer: "https://open.spotify.com/",
          Origin: "https://open.spotify.com",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_data: {
            client_version: cversion,
            client_id: access.clientId,
            js_sdk_data: {
              device_brand: "unknown",
              device_model: "unknown",
              os: "windows",
              os_version: "NT 10.0",
              device_id: access.deviceId,
              device_type: "computer",
            },
          },
        }),
      })
    ).json();

    if (res.response_type !== "RESPONSE_GRANTED_TOKEN_RESPONSE")
      throw new Error("failed to get spotify client token (#2)");

    client.token = res.granted_token.token;
    client.expiresAt =
      Date.now() + res.granted_token.refresh_after_seconds * 1000;
  }

  return client.token!;
}
