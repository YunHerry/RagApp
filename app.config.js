require('dotenv').config();

export default {
  expo: {
    name: 'K',
    slug: 'rag_app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon1.png',
    scheme: 'rag_app',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#282c34',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: './assets/images/icon1.png',
        backgroundColor: '#282c34',
      },
      package: 'com.anonymous.rag_app',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-build-properties',
      'expo-document-picker',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '518010bc-96d4-45c7-8e57-88ab90be88a3',
      },
      apiUrl: process.env.API_URL,
    },
    owner: 'xianyyyyyyyyyyyyyu',
  },
};
