export const privacyPolicy = {
  title: "Privacy Policy",
  lastUpdated: "June 11, 2026",
  sections: [
    {
      heading: "Overview",
      body: "GeoNotes is designed to operate entirely offline. Your notes, location tags, and search activity are stored locally on your device using an embedded SQLite database with SpatiaLite extensions.",
    },
    {
      heading: "Data We Do Not Collect",
      body: "In normal offline use, GeoNotes does not transmit your notes, location, or search history to any server. No analytics SDKs track your writing or browsing within the app.",
    },
    {
      heading: "Optional Sync",
      body: "If you enable sync in the future, the app may send note events you create to the GeoNotes sync server. Sync is opt-in and requires explicit configuration.",
    },
    {
      heading: "Backup and Export",
      body: "You may export notes to a local file on your device. Exported files are under your control and are not uploaded by the app unless you choose to share them.",
    },
    {
      heading: "Location Permissions",
      body: "GeoNotes requests location access to tag notes with geographic context and compute distances. Location data is processed on-device and is not uploaded unless you configure sync.",
    },
    {
      heading: "Crash Reporting",
      body: "Production builds may use Firebase Crashlytics to collect anonymized crash reports. These reports help improve app stability and do not include your note content.",
    },
    {
      heading: "Contact",
      body: "Questions about this policy can be directed to the project maintainers via the GeoNotes GitHub repository.",
    },
  ],
} as const;
