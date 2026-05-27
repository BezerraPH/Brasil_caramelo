/**
 * Config Capacitor — tipos locais (CLI instalada via setup-capacitor.sh).
 * @see https://capacitorjs.com/docs/config
 */
type CapacitorConfig = {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    url: string;
    cleartext?: boolean;
    androidScheme?: string;
  };
  android?: { allowMixedContent?: boolean };
};

const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "http://192.168.1.4:3000";

const config: CapacitorConfig = {
  appId: "com.brasilcaramelo.app",
  appName: "Brasil Caramelo",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    androidScheme: serverUrl.startsWith("https") ? "https" : "http",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
