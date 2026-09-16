import messaging from '@react-native-firebase/messaging';

export const registerPushToken = async () => {
  const permission = await messaging().requestPermission();

  if (permission) {
    const token = await messaging().getToken();
    console.log(token);
    return token;
  }
};