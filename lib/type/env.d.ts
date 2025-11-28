import 'expo-constants';

declare module 'expo-constants' {
  const Constants: {
    expoConfig?: {
      extra?: {
        apiUrl?: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
  
  export default Constants;
}