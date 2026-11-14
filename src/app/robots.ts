export const dynamic = "force-static";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: [
          "/",
          "/*/bolgeler",
          "/*/bolgeler/*",
        ],
        disallow: [
          "/admin",
          "/api/",
          "/*/kayitlerim", // Wishlist page is unique to the user's localStorage (prevent crawler budget waste)
          "/*?search=",    // Prevent indexing search queries (avoid search parameter crawling traps)
          "/*&search=",
        ],
      },
    ],
    sitemap: "https://www.yoldefterim.com.tr/sitemap.xml",
  };
}
