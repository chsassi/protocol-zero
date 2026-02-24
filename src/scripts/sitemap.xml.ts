import type { APIRoute } from "astro";
import artists from "../data/artists.json";

const SITE = "https://protocolzero.online";

export const GET: APIRoute = async () => {
  const staticPages = [
    "/",
    "/about",
    "/artists",
    "/contacts",
    "/releases",
    "/mixes",
    "/shop",
  ];

  const artistPages = (artists as any[])
    .filter((artist) => typeof artist.slug === "string")
    .map((artist) => `/artists/${artist.slug}`);

  const urls = [...staticPages, ...artistPages];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url>
    <loc>${SITE}${path}</loc>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};