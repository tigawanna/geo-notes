# GeoNotes

**🚧 Work in Progress 🚧**

GeoNotes is a React Native mobile application built with Expo that automatically organizes your notes based on your current location. **All operations run 100% locally** - no internet connection required after initial installation. The app uses SQLite with Spatialite for offline geospatial data storage and leverages modern React Native development practices.

**Note:** This is currently an Android-only project. iOS support is not yet implemented.

## Features

- **100% Offline Operation** - All data and functionality work without internet connection
- **Location-Based Note Sorting** - Notes automatically organize themselves based on your current location
- Real-time location detection and distance calculations
- Advanced search and filtering through your notes
- Material Design 3 with dynamic color theming (Material You)
- Dark/light mode with automatic system preference detection
- Local SQLite database with Spatialite extension for geospatial queries
- Responsive UI optimized for mobile devices

![Screenshot_20260303-171542](https://github.com/user-attachments/assets/87bf0d34-d53b-4096-8e29-77f001cdc0a6)
![Screenshot_20260303-171604](https://github.com/user-attachments/assets/03882ef4-4f32-4982-933e-2bc6e3ba1bea)
![Screenshot_20260303-171421](https://github.com/user-attachments/assets/bae35f65-979b-4090-baed-28406de4c337)

## Prerequisites

- Node.js (LTS version recommended)
- Expo CLI
- Android Studio (for Android development/emulator)
- npm package manager

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd geo-notes
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npx expo start
   ```

4. **Run on Android:**

   ```bash
   npx expo run:android
   ```

5. **Run on iOS:**
   ```bash
   npx expo run:ios
   ```

## Project Structure

```
src/
├── app/                 # File-based routing with Expo Router
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── index.tsx      # Home screen (notes list)
│   │   ├── explore.tsx    # Explore screen
│   │   └── settings.tsx   # Settings screen
│   ├── _layout.tsx        # Root layout with providers
│   └── +not-found.tsx     # 404 screen
├── components/          # Reusable UI components
├── constants/           # Application constants
├── hooks/               # Custom React hooks
├── lib/                 # Library integrations and utilities
├── store/               # Global state management
└── modules/             # Custom Expo modules
```

## Key Technologies

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **UI Library**: React Native Paper with Material Design 3
- **State Management**: Zustand for global state, React Query for local data caching
- **Database**: SQLite with Spatialite extension via custom Expo modules (100% local)
- **ORM**: Drizzle ORM for type-safe database operations
- **Storage**: AsyncStorage for persisted settings and preferences
- **Geospatial**: Local coordinate calculations and distance computations

## Privacy & Offline Operation

**GeoNotes operates entirely offline** - your location data and notes never leave your device. All geographic calculations, database queries, and note organization are performed locally using the embedded SQLite database with Spatialite extensions.

## Platform Support

This is currently an **Android-only** project. While the codebase uses cross-platform technologies, it has only been tested and optimized for Android devices. iOS support is not yet implemented and may require additional work to function properly.
