module.exports = {
  cli: {
    version: ">= 13.1.1",
    appVersionSource: "remote",
  },
  build: {
    development: {
      developmentClient: true,
      distribution: "internal",
      android: {
        buildType: "apk",
      },
      env: {
        EXPO_PUBLIC_FIREBASE_APIKEY: process.env.EXPO_PUBLIC_FIREBASE_APIKEY,
        EXPO_PUBLIC_FIREBASE_APPID: process.env.EXPO_PUBLIC_FIREBASE_APPID,
        EXPO_PUBLIC_GEOAPIFY_API_KEY: process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY,
        EXPO_PUBLIC_GCP_API_KEY: process.env.EXPO_PUBLIC_GCP_API_KEY,
      },
    },
    preview: {
      distribution: "internal",
      android: {
        buildType: "apk",
      },
      env: {
        EXPO_PUBLIC_FIREBASE_APIKEY: process.env.EXPO_PUBLIC_FIREBASE_APIKEY,
        EXPO_PUBLIC_FIREBASE_APPID: process.env.EXPO_PUBLIC_FIREBASE_APPID,
        EXPO_PUBLIC_GEOAPIFY_API_KEY: process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY,
        EXPO_PUBLIC_GCP_API_KEY: process.env.EXPO_PUBLIC_GCP_API_KEY,
      },
    },
    production: {
      autoIncrement: true,
      android: {
        buildType: "apk",
      },
      env: {
        EXPO_PUBLIC_FIREBASE_APIKEY: process.env.EXPO_PUBLIC_FIREBASE_APIKEY,
        EXPO_PUBLIC_FIREBASE_APPID: process.env.EXPO_PUBLIC_FIREBASE_APPID,
        EXPO_PUBLIC_GEOAPIFY_API_KEY: process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY,
        EXPO_PUBLIC_GCP_API_KEY: process.env.EXPO_PUBLIC_GCP_API_KEY,
      },
    },
  },
  submit: {
    production: {},
  },
};
