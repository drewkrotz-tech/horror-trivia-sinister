import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sinistertrivia.app',
  appName: 'Horror Trivia By Sinister',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
  },
};

export default config;
