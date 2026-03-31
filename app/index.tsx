import { useState, useEffect } from 'react';
import SplashScreenComponent from '@/components/SplashScreen';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexRoute() {
  const [animationFinished, setAnimationFinished] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (animationFinished && !loading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [animationFinished, loading, user]);

  return <SplashScreenComponent onFinish={() => setAnimationFinished(true)} />;
}