import type { MetadataRoute } from "next";
import { siteConfig } from "./site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/launch",
    scope: "/",
    display: "standalone",
    background_color: "#f4f8f5",
    theme_color: "#0b7c71",
    categories: ["shopping", "productivity", "utilities"],
    lang: "ko-KR",
    icons: [
      {
        src: "/specpilot-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/product-workbench.png",
        sizes: "1200x720",
        type: "image/png",
      },
    ],
  };
}
