import got from "got";
import { API_URL } from "./constants";

export const get = (path: string) =>
  got(new URL(path, API_URL))
    .json()
    .then((body: any) => body.data);

export const post = <T = any | void>(
  path: string,
  body: Record<string, any>
): Promise<T | void> => {
  return got
    .post(new URL(path, API_URL), { body: JSON.stringify(body) })
    .json()
    .then((r) => r as T)
    .catch((e) => {
      console.error("post", e.request);
    });
};
