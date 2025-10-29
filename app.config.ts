import { ConfigContext, ExpoConfig } from "expo/config";
const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.tigawanna.geonotes.dev";
  }

  if (IS_PREVIEW) {
    return "com.tigawanna.geonotes.preview";
  }

  return "com.tigawanna.geonotes";
};
type UniqueIDT = ReturnType<typeof getUniqueIdentifier>;

const getAppName = () => {
  if (IS_DEV) {
    return { name: "GeoNotes (Dev)", slug: "geo-notes" };
  }

  if (IS_PREVIEW) {
    return { name: "GeoNotes (Preview)", slug: "geo-notes" };
  }

  return { name: "GeoNotes", slug: "geo-notes" };
};

const getPlugins = (idt: UniqueIDT) => {
  const is_production = idt === "com.tigawanna.geonotes";
  const plugins: ConfigContext["config"]["plugins"] = [
    "expo-router",
    "expo-background-task",
    "./plugins/opsqlite-spatialite/with-spatialite",
    "@react-native-firebase/app",
    // "@react-native-firebase/crashlytics",
    [
      "expo-splash-screen",
      {
        image: "./assets/icons/splash-icon-light.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#F3EDEB",
        dark: {
          image: "./assets/icons/splash-icon-dark.png",
          backgroundColor: "#8B685C",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: is_production ? false : true, // ? enable HTTP requests
        },
        ios: {
          flipper: true,
        },
      },
    ],
  ];
  return plugins;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const { name, slug } = getAppName();
  const appIdentifier = getUniqueIdentifier();
  const plugins = getPlugins(appIdentifier);
  const is_production = appIdentifier === "com.tigawanna.geonotes";
  return {
    ...config,
    name: name,
    slug: slug,
    scheme: slug,
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/icons/splash-icon-dark.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      ...config.ios,
      supportsTablet: true,
      infoPlist: {
        NSAppTransportSecurity: { NSAllowsArbitraryLoads: is_production ? false : true }, // ? enable HTTP requests
      },
      icon: {
        light: "./assets/icons/ios-light.png",
        dark: "./assets/icons/ios-dark.png",
        tinted: "./assets/icons/ios-tinted.png",
      },
      bundleIdentifier: appIdentifier,
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        backgroundColor: "#8B685C",
        foregroundImage: "./assets/icons/adaptive-icon.png",
        monochromeImage: "./assets/icons/adaptive-icon.png",
      },
      // googleServicesFile: "./google-services.json",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: appIdentifier,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins,
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    extra: {
      router: {},
      eas: {
        projectId: "7236754d-2f0f-409d-948f-970fb269d990",
      },
    },
  };
};
