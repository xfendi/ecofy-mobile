import "dotenv/config";

export default {
  expo: {
    name: "Ecofy",
    slug: "ecofy-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GCP_API_KEY,
        }
      },
      permissions: ["android.permission.RECORD_AUDIO"],
      package: "com.fendziorr.ecofymobile",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-image-picker",
        {
          photosPermission: "Aplikacja potrzebuje uprawnień do zdjęć.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "3699e145-6e6a-4845-bd6c-b0533fb73a7f",
      },
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_APIKEY,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APPID,
      geoapifyApiKey: process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY,
      googleMapsApiKey: process.env.EXPO_PUBLIC_GCP_API_KEY,
    },
    owner: "fendziorr",
  },
};
