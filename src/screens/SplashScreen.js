import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import CleverTap from 'clevertap-react-native';

const VALID_PUSH_SCREENS = ['Screen1', 'Screen2', 'Screen3', 'Screen4', 'Home'];

const SplashScreen = ({navigation, route}) => {
  const isFromPush = route?.params?.isFromPush || false;
  const pushTargetScreen = route?.params?.pushTargetScreen || null;

  useEffect(() => {
    if (isFromPush) {
      const destination =
        pushTargetScreen && VALID_PUSH_SCREENS.includes(pushTargetScreen)
          ? pushTargetScreen
          : 'Home';

      console.log(
        `[SplashScreen] Push launch — target: ${destination} — NOT suspending InApps`,
      );

      const timer = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{name: destination}],
        });
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      console.log('[SplashScreen] Normal launch — suspending InApps');
      CleverTap.suspendInAppNotifications();

      const timer = setTimeout(() => {
        navigation.replace('Home');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigation, isFromPush, pushTargetScreen]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C4283C" />
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>CT</Text>
        </View>
        <Text style={styles.appName}>CleverTap POC New</Text>
        <Text style={styles.tagline}>InApp Notification Demo</Text>
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
      <View style={styles.debugBadge}>
        <Text style={styles.debugText}>
          {isFromPush
            ? `🔔 Push Launch → ${pushTargetScreen || 'Home'}`
            : '⏸ InApp Suspended'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C4283C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {alignItems: 'center', marginBottom: 60},
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagline: {fontSize: 14, color: 'rgba(255,255,255,0.75)', letterSpacing: 1},
  loadingContainer: {alignItems: 'center', gap: 12},
  loadingText: {fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8},
  debugBadge: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  debugText: {color: '#FFD700', fontSize: 12, fontWeight: '600'},
});

export default SplashScreen;
