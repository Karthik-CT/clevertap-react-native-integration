import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ToastAndroid,
  AppState,
  Linking,
  ScrollView,
} from 'react-native';
import {Component} from 'react';
import {Button, Alert, Text} from 'react-native';

import {NativeModules} from 'react-native';

const CleverTap = require('clevertap-react-native');

const {CTModule, CLTModule} = NativeModules;

const Separator = () => <View style={styles.separator} />;

let cleverTapInstance = null;

Linking.addEventListener('url', e => {
  console.log('Deeplink inside app: ' + e.url);
  handleDeepLink(e.url);
});
/// this handles the case where a deep link launches the application
Linking.getInitialURL()
  .then(url => {
    if (url) {
      console.log('launch url', url);
      handleDeepLink(e.url); // Added deep link handler
    }
  })
  .catch(err => console.error('launch url error', err));
// check to see if CleverTap has a launch deep link

// handles the case where the app is launched from a push notification containing a deep link
CleverTap.getInitialUrl((err, url) => {
  if (url) {
    console.log('CleverTap launch url', url);
    handleDeepLink(url); // Added deep link handler
  } else if (err) {
    console.log('CleverTap launch url', err);
  }
});

CleverTap.enablePersonalization();

CleverTap.getAllInboxMessages((err, res) => {
  console.log('All Inbox Messages: ', res, err);
  console.log('LOGGGG: ', res.length);
});

CleverTap.addListener(CleverTap.CleverTapPushNotificationClicked, event => {
  console.log(
    'handleCleverTapEvent',
    CleverTap.CleverTapPushNotificationClicked,
    event,
  );
  // Handle deep link on push notification click
  handleDeepLink(event.customExtras['wzrk_dl']);
});

CleverTap.addListener(
  CleverTap.CleverTapInAppNotificationButtonTapped,
  event => {
    console.log(
      'handleCleverTapEvent',
      CleverTap.CleverTapPushNotificationClicked,
      event,
    );
    // Handle deep link on push notification click
    handleDeepLink(event.customExtras['wzrk_dl']);
  },
);

const navigationRef = React.createRef();

// Function to handle deep link and extract parameters
function handleDeepLink(url) {
  console.log('Function to handle deep link and extract parameters');
  if (url) {
    const route = url.replace(/.*?:\/\//g, ''); // Extract route
    console.log('Route: ' + route);
    const screen = route.split('?')[0]; // Get the screen name
    console.log('Screen: ' + screen);
    const queryParams = route.split('?')[1]; // Get the query params
    console.log('queryParams: ' + queryParams);

    const params = {};
    if (queryParams) {
      queryParams.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[key] = value; // Extract parameters (e.g., coupon_code)
        console.log('params[key]: ' + params[key]);
      });
    }

    if (navigationRef.current?.isReady()) {
      navigationRef.current?.navigate(screen, params); // Navigate to the screen with params
    }
  }
}

CleverTap.addListener(CleverTap.CleverTapInboxDidInitialize, event => {
  _handleCleverTapInbox(CleverTap.CleverTapInboxDidInitialize, event);
});

CleverTap.addListener(CleverTap.CleverTapInboxMessageTapped, event => {
  var abc = JSON.stringify(event);
  console.log('CleverTapInboxMessageTapped: ', abc);
});

CleverTap.addListener(CleverTap.CleverTapDisplayUnitsLoaded, data => {
  console.log('From ND Add Listener: ', JSON.stringify(data));
});

function _handleCleverTapInbox(eventName, event) {
  console.log('handleCleverTapInbox', eventName, event);
  ToastAndroid.show(`${eventName} called!`, ToastAndroid.SHORT);
}

class Home extends Component {
  constructor(props) {
    super(props);
    CleverTap.setDebugLevel(3);
    CleverTap.initializeInbox();
    // CTModule.initCleverTap("Kuwait");
  }

  state = {
    title: 'Title',
    message: 'Message',
    appState: AppState.currentState,
  };

  //to add the listener
  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    console.log('This is from didMount');
    // CTModule.initCleverTap('Kuwait');
  }

  //to remove the listener
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  //To fetch the app state
  _handleAppStateChange = nextAppState => {
    this.setState({appState: nextAppState});

    console.log('AppState' + this.state.appState);
    if (this.state.appState === 'background') {
      //for background
      console.log('Background Mode.');
    } else if (this.state.appState === 'active') {
      //for foreground
      console.log('Foreground Mode.');
    } else if (this.state.appState === 'inactive') {
      //for inactive
      console.log('inactive Mode.');
    }
  };

  profileGetProp = () => {
    CleverTap.profileGetProperty('MSG-email', (err, res) => {
      console.log('CleverTap GetProperty  => CleverTap MSG-email: ', res, err);
    });
    CleverTap.profileGetProperty('Email', (err, res) => {
      console.log('CleverTap GetProperty  => CleverTap Email: ', res, err);
    });
    CleverTap.profileGetProperty('Name', (err, res) => {
      console.log('CleverTap GetProperty  => CleverTap Name: ', res, err);
    });
  };

  updateProfile = () => {
    // CleverTap.profileSet({
    //   DOB: new Date('1996-10-11T06:35:31'),
    //   UserPropKey: 'UserPropValue',
    //   Photo: 'https://www.entforall.com/images/founder.jpg',
    // });

    CleverTap.onUserLogin({
      'MSG-email': true,
      'MSG-push': true,
      'MSG-sms': true,
      'MSG-whatsapp': true,
    });
    //called from CTModule.java
    // CTModule.callOnUserLogin();

    Alert.alert('Profile Update Clicked');
  };

  pushEvent = () => {
    Alert.alert('Push Event Clicked');
    // CleverTap.recordEvent('Product Viewed');

    // event with properties
    var props = {test: 'Hello', test2: 'World'};

    CleverTap.recordEvent('React Native Event', props);
  };

  pushNotificationn = () => {
    Alert.alert('Push Notification Clicked');
    // CleverTap.recordEvent('Karthiks Noti Event');
    var props = {test: 'Hello', test2: 'World'};
    CTModule.raiseEvent('Karthiks Noti Event', props);
  };

  reactPush = () => {
    Alert.alert('React Push Notification Clicked');
    CleverTap.recordEvent('Karthiks React Noti Event');
  };

  reactKKPush = () => {
    Alert.alert('React Push Notification Clicked');
    // CleverTap.recordEvent('KarthikNotiEventNew');
    CleverTap.recordEvent('Test Sharif');
  };

  inApp = () => {
    Alert.alert('In App Clicked');
    CleverTap.recordEvent('Karthiks InApp Event');
  };

  //App Inbox
  appInbox = (eventName, event) => {
    console.log('CleverTap Inbox Event - ', eventName, event);
    CleverTap.recordEvent('Karthiks App Inbox Event');
    CleverTap.showInbox({
      tabs: ['Activites', 'Announcements'],
      navBarTitle: 'My App Inbox',
      navBarTitleColor: '#000000',
      navBarColor: '#FFFFFF',
      inboxBackgroundColor: '#AED6F1',
      backButtonColor: '#000000',
      noMessageText: 'No message(s)',
      noMessageTextColor: '#FF0000',
      unselectedTabColor: '#0000FF',
      selectedTabColor: '#FF0000',
      selectedTabIndicatorColor: '#000000',
      firstTabTitle: 'Activities',
    });

    CleverTap.getAllInboxMessages((err, res) => {
      console.log('All Inbox Messages: ', res, err);
      console.log('LOGGGG: ', res.length);
    });

    Alert.alert('App Inbox Clicked');
  };

  nativeDisplay = () => {
    CleverTap.recordEvent('Karthiks Native Display Event');
    // CleverTap.recordEvent('KarthikNotiEventNew');
    // var props = {
    //   'Product Name': 'Home Beauty Callus Remover Device | 1.5 V',
    //   'Product SKU': '16190009',
    //   'Product Price': '177.5',
    //   'Brand Name': 'HOME BEAUTY',
    //   'Is In Stock': '1',
    // };
    // CleverTap.recordEvent('Product Viewed', props);
    // setTimeout(() => {
    //   CleverTap.getAllDisplayUnits((err, res) => {
    //     console.log('All Display Units: ', JSON.stringify(res), err);
    //   });
    // }, 10000);

    CleverTap.addListener(CleverTap.CleverTapDisplayUnitsLoaded, data => {
      console.log('This is unit iD: ', data);
    });
    CleverTap.getAllDisplayUnits((err, res) => {
      console.log('All Display Units: ', res, err);
      // this.setState({datasource: JSON.parse(res)});
      this.setState({datasource: res});
      console.log('this is Datasource: ', this.state.datasource[0]);
      //   // this.setState({
      //   //   title: JSON.stringify(
      //   //     this.state.datasource.content[0].title.text,
      //   //   ).replace(/['"]+/g, ''),
      //   //   message: JSON.stringify(
      //   //     this.state.datasource.content[0].message.text,
      //   //   ).replace(/['"]+/g, ''),
      //   // });
      //   // this.setState({
      //   //   title: JSON.stringify(
      //   //     this.state.datasource.content[0].title.text,
      //   //   ).replace(/['"]+/g, ''),
      //   //   message: JSON.stringify(
      //   //     this.state.datasource.content[0].message.text,
      //   //   ).replace(/['"]+/g, ''),
      //   // });
      Alert.alert('Native Display Clicked');

      //   //   // for Display Unit Id use the below one
      console.log('This is wzrk_id:', this.state.datasource[0].wzrk_id);
      CleverTap.pushDisplayUnitViewedEventForID(this.state.datasource.ti);
      CleverTap.pushDisplayUnitClickedEventForID(this.state.datasource.ti);

      // this.setState({datasource: JSON.parse(res)});
      // this.setState({nativekey: this.state.datasource.wzrk_id}); //Store wzrk_id to use it as Unit_id
      this.setState({
        message: this.state.datasource[0].content[0].message.text,
        title: this.state.datasource[0].content[0].title.text,
      });
    });
  };

  goToKuwait = () => {
    CTModule.initCleverTap('KSA');
    CTModule.resurrectApp();
  };
  goToOman = () => {
    CTModule.initCleverTap('UAE');
    CTModule.resurrectApp();
  };

  promotionalNotif = () => {
    CleverTap.profileSet({
      disablePromotionalNoti: 'yes',
    });
  };

  profileOpen = () => {
    this.props.navigation.navigate('Profile');
  };

  getValues = () => {
    CLTModule.printStoredValues((error, result) => {
      if (error) {
        console.error('Error fetching stored values:', error);
      } else {
        console.log('Stored Values:', result);
        // Example: Access the variables
        const {redirectionUrl, channelValue, channelName} = result;
        console.log('redirectionUrl:', redirectionUrl);
        console.log('channelValue:', channelValue);
        console.log('channelName:', channelName);
      }
    });
  };

  render() {
    return (
      <ScrollView>
        <SafeAreaView style={styles.container}>
          <View>
            {/* Grid layout for buttons */}
            <View style={styles.gridContainer}>
              <View style={styles.row}>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Custom App Inbox"
                    onPress={() =>
                      this.props.navigation.navigate('CustomAppInbox')
                    }
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Native Display"
                    onPress={() =>
                      this.props.navigation.navigate('NativeDisplay')
                    }
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="WebView"
                    onPress={() => this.props.navigation.navigate('WebView')}
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="ProdExp"
                    onPress={() => this.props.navigation.navigate('ProdExp')}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="GeoFence"
                    onPress={() => this.props.navigation.navigate('GeoFence')}
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Profile"
                    onPress={() => this.props.navigation.navigate('Profile')}
                  />
                </View>
              </View>
            </View>

            <Button title="Go To KSA" onPress={this.goToKuwait} />
            <Separator />
            <Button title="Go To UAE" onPress={this.goToOman} />
            <Separator />
            <Button title="Get Value" onPress={this.getValues} />
            <Separator />
            <Button title="Update Profile" onPress={this.updateProfile} />
            <Separator />
            <Button title="Push Event" onPress={this.pushEvent} />
            <Separator />
            <Button
              title="Push Notification"
              onPress={this.pushNotificationn}
            />
            <Separator />
            <Button title="In App" onPress={this.inApp} />
            <Separator />
            <Button title="App Inbox" onPress={this.appInbox} />
            <Separator />
            <Button title="Native Display" onPress={this.nativeDisplay} />
            <Separator />
            <Button title="React KK PN" onPress={this.reactKKPush} />
            <Separator />
            <Button title="Promotional" onPress={this.promotionalNotif} />
            <Separator />
            <Text style={styles.titleText}>Native Display Message </Text>
            <Separator />
            <Text style={styles.textND}>{this.state.title}</Text>
            <Separator />
            <Text style={styles.textND}>{this.state.message}</Text>
            <Separator />
            <Button
              title="Get Profile Property"
              onPress={this.profileGetProp}
            />
            <Separator />
          </View>
        </SafeAreaView>
      </ScrollView>
    );
  }
}

// CleverTap.onUserLogin({
//   Email: 'iamreactnativeuser@test.com',
//   disablePromotionalNoti: 'no',
//   'MSG-email': true,
//   'MSG-push': true,
//   'MSG-sms': true,
//   'MSG-whatsapp': true,
// });

CleverTap.createNotificationChannel(
  'testkk123',
  'React Native Test',
  'This is a React-Native test by Karthik',
  5,
  true,
);

CleverTap.createNotificationChannel(
  'transactional',
  'transactional_test',
  'This is a transactional_test by Karthik',
  5,
  true,
);

CleverTap.createNotificationChannel(
  'promotional',
  'promotional_test',
  'This is a promotional_test by Karthik',
  5,
  true,
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: 'teal',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  textND: {
    fontSize: 18,
    color: 'black',
  },
  gridContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5, // To add spacing between buttons
  },
  button: {
    flex: 1,
  },
});

export default Home;
