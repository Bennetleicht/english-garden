import type { MetadataRoute } from "next";

/** Ermöglicht „Zum Home-Bildschirm hinzufügen“ auf iPad, iPhone und Android. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "English Garden",
    short_name: "English Garden",
    description: "Dein ruhiger Ort zum Englischlernen.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfaf6",
    theme_color: "#fcfaf6",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
