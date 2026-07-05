import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://logitechtransport-de6f1e.duckbyte.co/sitemap.xml",
  };
}
