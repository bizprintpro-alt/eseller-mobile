import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

// Deduplicated — `feed/create.tsx` (366 lines) is the canonical create
// post screen. This wrapper forwards legacy deep links to it so any
// existing navigation callers keep working.
export default function CreatePostRedirect() {
  useEffect(() => {
    router.replace('/feed/create' as never);
  }, []);
  return <View />;
}
