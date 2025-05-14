import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pip-Boy 3000",
    short_name: "Pip-Boy",
    description: "A Fallout-inspired Pip-Boy interface for task management and character tracking",
    start_url: "/",
    display: "standalone",
    background_color: "#0b3d0b",
    theme_color: "#0b3d0b",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/screenshot1.png",
        sizes: "1080x1920",
        type: "image/png",
        label: "Pip-Boy Tasks Screen",
      },
      {
        src: "/screenshots/screenshot2.png",
        sizes: "1080x1920",
        type: "image/png",
        label: "Pip-Boy Stats Screen",
      },
    ],
    categories: ["productivity", "games", "utilities"],
    shortcuts: [
      {
        name: "Tasks",
        url: "/?tab=tasks",
        description: "View your tasks",
        icons: [{ src: "/icons/tasks-icon.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Stats",
        url: "/?tab=stats",
        description: "View your character stats",
        icons: [{ src: "/icons/stats-icon.png", sizes: "96x96", type: "image/png" }],
      },
      {
        name: "Inventory",
        url: "/?tab=inventory",
        description: "View your inventory",
        icons: [{ src: "/icons/inventory-icon.png", sizes: "96x96", type: "image/png" }],
      },
    ],
  }
}
