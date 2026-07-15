import type { CapacitorConfig } from "@capacitor/cli";

// IMPORTANT: replace this with your real, live Vercel production URL
// (e.g. "https://ruth-yourname.vercel.app" or your custom domain).
// This is what the native app will load — it must be the deployed site,
// not localhost, since the phone won't have access to your dev machine.
const PRODUCTION_URL = "https://REPLACE-WITH-YOUR-VERCEL-URL.vercel.app";

const config: CapacitorConfig = {
  appId: "com.ruth.journal", // reverse-domain style ID, used by both stores. Change if you want a different package name.
  appName: "Ruth",
  webDir: "public", // required by Capacitor even though we load a remote URL, not a local bundle
  server: {
    url: PRODUCTION_URL,
    androidScheme: "https",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
