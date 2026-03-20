import React from 'react';
import BaseScreen from './BaseScreen';

const Screen2 = ({navigation}) => {
  return (
    <BaseScreen
      navigation={navigation}
      screenName="Screen2"
      screenTitle="Profile"
      accentColor="#7B68EE"
      icon="👤"
      eventName="Profile Screen Viewed"
      content={
        'This is the Profile screen.\n\n' +
        'Push notification deep-link key:\n"screenName" = "Screen2"\n\n' +
        'When a user taps a push notification with this key-value pair, ' +
        'the app opens directly on this screen — bypassing SplashScreen completely.\n\n' +
        'Since suspendInAppNotifications() is only called in SplashScreen, ' +
        'InApps are fully active here and will display immediately.'
      }
    />
  );
};

export default Screen2;
