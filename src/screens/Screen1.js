import React from 'react';
import BaseScreen from './BaseScreen';

const Screen1 = ({navigation}) => {
  return (
    <BaseScreen
      navigation={navigation}
      screenName="Screen1"
      screenTitle="Products"
      accentColor="#4A90E2"
      icon="🛍"
      eventName="Products Screen Viewed"
      content={
        'This is the Products screen.\n\n' +
        'Push notification deep-link key:\n"screenName" = "Screen1"\n\n' +
        'When a user taps a push notification with this key-value pair, ' +
        'the app opens directly on this screen — bypassing SplashScreen completely.\n\n' +
        'Since suspendInAppNotifications() is only called in SplashScreen, ' +
        'InApps are fully active here and will display immediately.'
      }
    />
  );
};

export default Screen1;
