import type { MetadataRoute } from "next";
import { absoluteUrl } from "./site-config";

const publicRoutes = [
  { path: "/", priority: 0.9, changeFrequency: "daily" },
  { path: "/launch", priority: 1.0, changeFrequency: "daily" },
  { path: "/launch/tools", priority: 0.8, changeFrequency: "weekly" },
  { path: "/launch/guide", priority: 0.75, changeFrequency: "weekly" },
  { path: "/join", priority: 0.7, changeFrequency: "weekly" },
  { path: "/market/desktop-pc", priority: 0.85, changeFrequency: "weekly" },
  { path: "/market/laptop", priority: 0.85, changeFrequency: "weekly" },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
