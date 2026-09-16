import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

// 스크린 컴포넌트 임포트 (경로는 본인 프로젝트 구조에 맞게 확인해 주세요!)
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { useTranslation } from 'react-i18next';
import SavedScreen from './src/screens/SavedScreen';

// 🚀 네이티브 스택 네비게이터 생성
const Stack = createNativeStackNavigator();
export default function App() {
  // 🔔 기존 FCM 토큰 가져오기 로직 (그대로 유지)
  useEffect(() => {
    const getToken = async () => {
      try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
      } catch (e) {
        console.log('FCM error:', e);
      }
    };
    getToken();
  }, []);

  // 📩 기존 포그라운드 푸시 리스너 로직 (그대로 유지)
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📩 foreground push:', remoteMessage.notification);
    });
    return unsubscribe;
  }, []);

  const { t } = useTranslation();

  // 🚀 핵심: 네비게이션 컨테이너로 화면 트리 감싸기
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* 1. 첫 화면인 홈 화면 */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} // 홈 화면 상단 헤더는 숨김 처리
        />

        {/* 2. 🚀 왼쪽으로 쓸어넘기면 뒤로 가는 제스처가 내장된 히스토리 화면 */}
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            headerShown: true, // 상단 타이틀과 뒤로 가기 화살표 노출
            title: t('history'), // 헤더에 뜰 제목
            animation: 'slide_from_right', // 👉 오른쪽에서 왼쪽으로 스르륵 밀고 들어오는 애니메이션 효과
            gestureEnabled: true, // 👉 iOS/Android 왼쪽 끝 잡고 당기면 뒤로 가기 활성화
            headerStyle: {
              backgroundColor: '#0b111e', // 화면 배경색과 동일하게
            },
            headerTintColor: '#f8fafc', // 글자 및 뒤로가기 화살표 색상 (화이트)
            headerShadowVisible: false, // 하단 경계선 제거해서 깔끔하게
          }}
        />

        <Stack.Screen
          name="Saved"
          component={SavedScreen}
          options={{
            headerShown: true, // 상단 타이틀과 뒤로 가기 화살표 노출
            title: t('saved'), // 헤더에 뜰 제목
            animation: 'slide_from_right', // 👉 오른쪽에서 왼쪽으로 스르륵 밀고 들어오는 애니메이션 효과
            gestureEnabled: true, // 👉 iOS/Android 왼쪽 끝 잡고 당기면 뒤로 가기 활성화
            headerStyle: {
              backgroundColor: '#0b111e', // 화면 배경색과 동일하게
            },
            headerTintColor: '#f8fafc', // 글자 및 뒤로가기 화살표 색상 (화이트)
            headerShadowVisible: false, // 하단 경계선 제거해서 깔끔하게
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
