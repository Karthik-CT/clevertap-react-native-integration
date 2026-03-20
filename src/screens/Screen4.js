import React from 'react';
import BaseScreen from './BaseScreen';

const Screen4 = ({navigation}) => {
  return (
    <BaseScreen
      navigation={navigation}
      screenName="Screen4"
      screenTitle="Settings"
      accentColor="#FF8C00"
      icon="⚙️"
      eventName="Settings Screen Viewed"
      content={
        'This is the Settings screen.\n\n' +
        'Push notification deep-link key:\n"screenName" = "Screen4"\n\n' +
        'When a user taps a push notification with this key-value pair, ' +
        'the app opens directly on this screen — bypassing SplashScreen completely.\n\n' +
        'Since suspendInAppNotifications() is only called in SplashScreen, ' +
        'InApps are fully active here and will display immediately.'
      }
    />
  );
};

export default Screen4;
