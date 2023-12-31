export const root =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/"
    : "https://nexxsongs.vercel.app/";
export const api = `${root}api/`;
