import { MapPin, NotebookPen, RefreshCw, ShieldCheck, Smartphone, WifiOff } from "lucide-react";

export const landingNav = {
  status: "Offline notes · Location tags",
  links: [
    { label: "Capabilities", href: "#capabilities" },
    { label: "Why GeoNotes", href: "#why" },
    { label: "Privacy", href: "/privacy" },
  ],
} as const;

export const landingHero = {
  eyebrow: "Notes · Offline-first",
  title: "Your notes, tied to places — not the cloud.",
  description:
    "GeoNotes helps you capture and organize location-based notes entirely on your device. Tag entries by ward or coordinates, search locally, and back up when you choose — no account required for everyday use.",
  primaryCta: "Get the app",
  secondaryCta: "Open dashboard",
  mapPanel: {
    fileLabel: "notes.local",
    pathLabel: "/places/tags",
    coords: "-1.2921, 36.8219",
    legend: [
      { label: "Note", tone: "primary" },
      { label: "Tag", tone: "info" },
      { label: "Place", tone: "warning" },
    ],
  },
  navPanel: {
    title: "Site visit notes",
    distance: "12 entries",
    elevation: "3 tags",
    eta: "Kilimani",
  },
} as const;

export const landingCapabilities = {
  heading: "From the field to your pocket",
  description:
    "A private notebook on your phone, with an optional sync hub when you are ready to share verified updates.",
  steps: [
    {
      id: "01",
      label: "OFFLINE NOTES",
      icon: WifiOff,
      title: "Write without signal",
      description:
        "Notes, tags, and location metadata live in a local SQLite database. Capture ideas in the field and find them later — no connection needed.",
    },
    {
      id: "02",
      label: "LOCATION TAGS",
      icon: MapPin,
      title: "Organize by place",
      description:
        "Attach coordinates or ward context to notes. Distance and proximity search run on-device using SpatiaLite.",
    },
    {
      id: "03",
      label: "SYNC HUB",
      icon: RefreshCw,
      title: "Share when you are ready",
      description:
        "Optional sync sends note events through an append-only log. Admins verify changes before they reach other devices.",
    },
  ],
} as const;

export const landingReasons = {
  heading: "Built for privacy, not platforms",
  description:
    "Your notes are yours. GeoNotes keeps writing and lookup local by default, with sync only when you opt in.",
  items: [
    {
      icon: Smartphone,
      title: "Offline-first by design",
      description:
        "Create, edit, and search notes entirely on-device. The network is optional, never required.",
    },
    {
      icon: ShieldCheck,
      title: "Your data stays local",
      description:
        "Note content and location tags are not uploaded unless you configure sync or export a backup yourself.",
    },
    {
      icon: NotebookPen,
      title: "Structured field notes",
      description:
        "Tags, filters, and geographic context help you find the right note quickly — without a proprietary cloud service.",
    },
  ],
} as const;

export const landingCta = {
  title: "Capture notes where they happen",
  highlight: "happen",
  description:
    "Sign in to the admin hub to review sync events, or grab the mobile app to start writing offline.",
  primaryCta: "Open dashboard",
  secondaryCta: "Create an account",
} as const;

export const landingFooter = {
  tagline: "Offline notes · Location tags · Verified sync",
} as const;
