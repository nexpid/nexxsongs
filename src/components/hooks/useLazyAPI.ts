/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

export default function useLazyAPI<T>(
  url: string,
  init: RequestInit | undefined,
  parse?: (res: Response) => T | Promise<T>
): T | undefined {
  const [response, setResponse] = useState<T>();

  const reportError = (err: any) => {};

  useEffect(() => {
    const controller = new AbortController();

    setResponse(undefined);
    try {
      fetch(url, {
        ...(init ?? {}),
        signal: controller.signal,
      }).then(async (x) => {
        try {
          if (parse) setResponse(await parse(x));
          else setResponse(await x.json());
        } catch (e) {
          reportError(e);
        }
      }, reportError);
    } catch {}

    return () => controller.abort();
  }, [url, init]);

  return response;
}
