import React, {useCallback, useEffect, useRef} from 'react';
import {BackHandler} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CleverTap from 'clevertap-react-native';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import Screen1 from './src/screens/Screen1';
import Screen2 from './src/screens/Screen2';
import Screen3 from './src/screens/Screen3';
import Screen4 from './src/screens/Screen4';

const Stack = createNativeStackNavigator();

const SPLASH_SCREEN_NAME = 'Splash';
const HOME_SCREEN_NAME = 'Home';
const VALID_PUSH_SCREENS = ['Screen1', 'Screen2', 'Screen3', 'Screen4', 'Home'];
const DEEP_LINK_SCREENS = ['Screen1', 'Screen2', 'Screen3', 'Screen4'];

CleverTap.setDebugLevel(3);

const App = ({isFromPush, pushTargetScreen}) => {
  const navigationRef = useRef(null);
  const isInAppVisibleRef = useRef(false);
  const lastResumedScreenRef = useRef(null);

  const handleNavigationStateChange = useCallback(() => {
    setTimeout(() => {
      const currentRoute = navigationRef.current?.getCurrentRoute();
      if (!currentRoute) return;

      const screenName = currentRoute.name;

      if (screenName === lastResumedScreenRef.current) return;
      lastResumedScreenRef.current = screenName;

      console.log(`[Nav] Screen → ${screenName}`);

      if (screenName === SPLASH_SCREEN_NAME) {
        console.log('[CleverTap] Splash — skipping resume');
        return;
      }

      console.log(`[CleverTap] resumeInAppNotifications for: ${screenName}`);
      CleverTap.resumeInAppNotifications();
    }, 0);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const currentRoute = navigationRef.current?.getCurrentRoute();
        const currentScreen = currentRoute?.name;
        const stackSize =
          navigationRef.current?.getRootState()?.routes?.length ?? 0;

        if (isInAppVisibleRef.current) {
          console.log('[BackHandler] InApp visible — consuming back');
          return true;
        }

        if (currentScreen === HOME_SCREEN_NAME) {
          console.log('[BackHandler] Home — exiting app');
          BackHandler.exitApp();
          return true;
        }
        if (DEEP_LINK_SCREENS.includes(currentScreen) && stackSize <= 1) {
          console.log(`[BackHandler] Deep-link root (${currentScreen}) → Home`);
          navigationRef.current?.navigate(HOME_SCREEN_NAME);
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const inAppShowListener = CleverTap.addListener(
      CleverTap.CleverTapInAppNotificationShowed,
      event => {
        console.log('[CleverTap] InApp shown', event);
        isInAppVisibleRef.current = true;
      },
    );

    const inAppDismissListener = CleverTap.addListener(
      CleverTap.CleverTapInAppNotificationDismissed,
      event => {
        console.log('[CleverTap] InApp dismissed', event);
        isInAppVisibleRef.current = false;
      },
    );

    const inAppButtonListener = CleverTap.addListener(
      CleverTap.CleverTapInAppNotificationButtonTapped,
      event => {
        console.log('[CleverTap] InApp button tapped', event);
        isInAppVisibleRef.current = false;
      },
    );

    const pushClickListener = CleverTap.addListener(
      CleverTap.CleverTapPushNotificationClicked,
      event => {
        console.log('[CleverTap] Push clicked (warm-start):', event);

        const targetScreen =
          event?.customExtras?.screenName || event?.screenName;
        const destination =
          targetScreen && VALID_PUSH_SCREENS.includes(targetScreen)
            ? targetScreen
            : HOME_SCREEN_NAME;

        const currentRoute = navigationRef.current?.getCurrentRoute();
        const currentScreen = currentRoute?.name;
        const fullStack =
          navigationRef.current?.getRootState()?.routes?.map(r => r.name) ?? [];

        console.log(
          `[CleverTap] Warm-start → current: ${currentScreen}, stack: ${JSON.stringify(
            fullStack,
          )}, target: ${destination}`,
        );

        if (currentScreen === destination) {
          console.log('[CleverTap] Already on target — skipping');
          return;
        }

        setTimeout(() => {
          if (fullStack.includes(SPLASH_SCREEN_NAME)) {
            console.log(
              '[CleverTap] Splash still in stack — resetting to [' +
                destination +
                ']',
            );
            navigationRef.current?.reset({
              index: 0,
              routes: [{name: destination}],
            });
          } else {
            navigationRef.current?.navigate(destination);
          }
        }, 300);
      },
    );

    return () => {
      inAppShowListener.remove();
      inAppDismissListener.remove();
      inAppButtonListener.remove();
      pushClickListener.remove();
    };
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={handleNavigationStateChange}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false}}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          initialParams={{
            isFromPush: isFromPush || false,
            pushTargetScreen: pushTargetScreen || null,
          }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Screen1" component={Screen1} />
        <Stack.Screen name="Screen2" component={Screen2} />
        <Stack.Screen name="Screen3" component={Screen3} />
        <Stack.Screen name="Screen4" component={Screen4} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
