import React from 'react';
import BaseScreen from './BaseScreen';

const Screen3 = ({navigation}) => {
  return (
    <BaseScreen
      navigation={navigation}
      screenName="Screen3"
      screenTitle="Orders"
      accentColor="#50C878"
      icon="📦"
      eventName="Orders Screen Viewed"
      content={
        'This is the Orders screen.\n\n' +
        'Push notification deep-link key:\n"screenName" = "Screen3"\n\n' +
        'When a user taps a push notification with this key-value pair, ' +
        'the app opens directly on this screen — bypassing SplashScreen completely.\n\n' +
        'Since suspendInAppNotifications() is only called in SplashScreen, ' +
        'InApps are fully active here and will display immediately.'
      }
    />
  );
};

export default Screen3;
