import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mz.pilotsrecords.app',
  appName: "Pilot's Records",
  webDir: 'dist',
  android: {
    backgroundColor: '#f8fafc',
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
