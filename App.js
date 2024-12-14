import React from 'react';
import {Linking} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import Home from './Home';
import Profile from './Profile';
import NativeDisplay from './NativeDisplay';
import CustomAppInbox from './CustomAppInbox';
import WebView from './WebView';
import ProdExp from './ProdExp';
import GeoFence from './GeoFence';
import Login from './Login';
import Country from './Country';

const Stack = createStackNavigator();

// Create a navigation reference
export const navigationRef = React.createRef();

export function navigate(name, params) {
  if (navigationRef.current?.isReady()) {
    // Navigate to the desired screen
    navigationRef.current?.navigate(name, params);
  }
}

const linking = {
  prefixes: ['karthikdl://'],
  config: {
    screens: {
      NativeDisplay: 'nativedisplaypage',
      GeoFence: 'geofencepage',
      CustomAppInbox: 'customaipage',
      WebView: 'webviewpage',
      ProdExp: 'prodexppage',
      Profile: 'mainpage',
      Login: 'loginpage',
    },
  },
};

const App = () => {
  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef} // Set the navigation reference
      onReady={() => {
        console.log('Navigation is ready');
      }}>
      <Stack.Navigator
        initialRouteName="Country" // Set initial screen to Country
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Country"
          component={Country}
          options={{title: 'Select Country'}}
        />
        <Stack.Screen name="Home" component={Home} options={{title: 'Home'}} />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{title: 'Profile'}}
        />
        <Stack.Screen
          name="NativeDisplay"
          component={NativeDisplay}
          options={{title: 'NativeDisplay'}}
        />
        <Stack.Screen
          name="CustomAppInbox"
          component={CustomAppInbox}
          options={{title: 'CustomAppInbox'}}
        />
        <Stack.Screen
          name="WebView"
          component={WebView}
          options={{title: 'WebView'}}
        />
        <Stack.Screen
          name="ProdExp"
          component={ProdExp}
          options={{title: 'ProdExp'}}
        />
        <Stack.Screen
          name="GeoFence"
          component={GeoFence}
          options={{title: 'GeoFence'}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{title: 'Login'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
