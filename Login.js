// import React, {useState} from 'react';
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   Text,
// } from 'react-native';
// import {NativeModules} from 'react-native';

// const {CTModule} = NativeModules;

// const CleverTap = require('clevertap-react-native');

// const Login = ({navigation}) => {
//   CleverTap.setDebugLevel(3);
//   CleverTap.initializeInbox();
//   const [inputValues, setInputValues] = useState({
//     name: '',
//     mobileNumber: '',
//     identity: '',
//     email: '',
//     password: '',
//   });

//   const [focusedInput, setFocusedInput] = useState(null); // Track focused input

//   const handleInputChange = (name, value) => {
//     if (name === 'mobileNumber') {
//       // Remove non-digit characters
//       const digitsOnly = value.replace(/[^0-9]/g, '');
//       // Allow only the first 10 digits
//       setInputValues(prevState => ({
//         ...prevState,
//         mobileNumber: digitsOnly.slice(0, 10),
//       }));
//     } else {
//       setInputValues(prevState => ({
//         ...prevState,
//         [name]: value,
//       }));
//     }
//   };

//   const handleSubmit = () => {
//     // Log all the values entered in the input text
//     console.log(inputValues);

//     // Optionally, you can show an alert with the input values
//     Alert.alert('Logged Values', JSON.stringify(inputValues));

//     // Redirect to Home Page
//     navigation.navigate('Home');

//     CleverTap.onUserLogin({
//       Name: inputValues.name,
//       Identity: inputValues.identity,
//       Email: inputValues.email,
//       Phone: '+91' + inputValues.mobileNumber,
//       disablePromotionalNoti: 'no',
//       'MSG-email': true,
//       'MSG-push': true,
//       'MSG-sms': true,
//       'MSG-whatsapp': true,
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>
//       <TextInput
//         style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
//         placeholder="Name"
//         placeholderTextColor="#999"
//         value={inputValues.name}
//         onChangeText={value => handleInputChange('name', value)}
//         onFocus={() => setFocusedInput('name')}
//         onBlur={() => setFocusedInput(null)}
//         // Set text color to black for visibility
//         textColor="#000"
//       />
//       <TextInput
//         style={[
//           styles.input,
//           focusedInput === 'mobileNumber' && styles.inputFocused,
//         ]}
//         placeholder="Mobile Number"
//         placeholderTextColor="#999"
//         keyboardType="phone-pad"
//         value={inputValues.mobileNumber}
//         onChangeText={value => handleInputChange('mobileNumber', value)}
//         onFocus={() => setFocusedInput('mobileNumber')}
//         onBlur={() => setFocusedInput(null)}
//         textColor="#000"
//       />
//       <TextInput
//         style={[
//           styles.input,
//           focusedInput === 'identity' && styles.inputFocused,
//         ]}
//         placeholder="Identity"
//         placeholderTextColor="#999"
//         value={inputValues.identity}
//         onChangeText={value => handleInputChange('identity', value)}
//         onFocus={() => setFocusedInput('identity')}
//         onBlur={() => setFocusedInput(null)}
//         textColor="#000"
//       />
//       <TextInput
//         style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
//         placeholder="Email ID"
//         placeholderTextColor="#999"
//         keyboardType="email-address"
//         value={inputValues.email}
//         onChangeText={value => handleInputChange('email', value)}
//         onFocus={() => setFocusedInput('email')}
//         onBlur={() => setFocusedInput(null)}
//         textColor="#000"
//       />
//       <TextInput
//         style={[
//           styles.input,
//           focusedInput === 'password' && styles.inputFocused,
//         ]}
//         placeholder="Password"
//         placeholderTextColor="#999"
//         secureTextEntry
//         value={inputValues.password}
//         onChangeText={value => handleInputChange('password', value)}
//         onFocus={() => setFocusedInput('password')}
//         onBlur={() => setFocusedInput(null)}
//         textColor="#000"
//       />
//       <TouchableOpacity style={styles.button} onPress={handleSubmit}>
//         <Text style={styles.buttonText}>Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 16,
//   },
//   title: {
//     fontSize: 25,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//     textAlign: 'center',
//     paddingVertical: 20,
//     color: '#2196f3',
//   },
//   input: {
//     height: 50,
//     borderColor: 'gray',
//     borderWidth: 1,
//     borderRadius: 25, // Oval-shaped inputs
//     marginBottom: 10, // Margin between inputs
//     paddingLeft: 16,
//     paddingRight: 16,
//     backgroundColor: '#fff', // Optional: Background color
//     placeholderTextColor: '#999', // Lighter placeholder text
//     color: '#000', // Set text color to black for visibility
//   },
//   inputFocused: {
//     borderColor: '#2196f3', // Blue border when focused
//     shadowColor: '#2196f3', // Subtle shadow for focus
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 2, // Shadow for Android
//   },
//   button: {
//     height: 50,
//     borderRadius: 25, // Oval-shaped button
//     backgroundColor: '#2196f3', // Button color
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 10, // Margin between inputs and button
//   },
//   buttonText: {
//     color: '#fff', // Text color
//     fontSize: 18,
//   },
// });

// export default Login;

// ******************************************************************************************

// import React, {useState} from 'react';
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   Text,
//   Platform,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {NativeModules} from 'react-native';

// const {CTModule, CLTModule} = NativeModules;
// const CleverTap = require('clevertap-react-native');

// const Login = ({navigation}) => {
//   CleverTap.setDebugLevel(3);
//   CleverTap.initializeInbox();

//   const [inputValues, setInputValues] = useState({
//     name: '',
//     mobileNumber: '',
//     identity: '',
//     email: '',
//     password: '',
//   });

//   const [focusedInput, setFocusedInput] = useState(null); // Track focused input

//   const handleInputChange = (name, value) => {
//     if (name === 'mobileNumber') {
//       const digitsOnly = value.replace(/[^0-9]/g, ''); // Only digits
//       setInputValues(prevState => ({
//         ...prevState,
//         mobileNumber: digitsOnly.slice(0, 10), // Max 10 digits
//       }));
//     } else {
//       setInputValues(prevState => ({
//         ...prevState,
//         [name]: value,
//       }));
//     }
//   };

//   const handleSubmit = async () => {
//     console.log('Input Values:', inputValues);
//     Alert.alert('Logged Values', JSON.stringify(inputValues));
//     navigation.navigate('Home');

//     const storedCountry =
//       (await AsyncStorage.getItem('selectedCountry')) || 'UAE'; // Default to UAE
//     console.log('Stored Country:', storedCountry);

//     try {
//       // Android Logic
//       if (Platform.OS === 'android' && CTModule) {
//         if (CTModule.initCleverTap) {
//           CTModule.initCleverTap();
//           console.log('CleverTap initialized on Android.');
//         }
//         CTModule.callOnUserLogin();
//         CTModule.resurrectApp();
//         console.log('callOnUserLogin executed successfully on Android.');
//       }

//       // iOS Logic
//       else if (Platform.OS === 'ios' && CLTModule) {
//         const config = {
//           UAE: {id: 'TEST-RK4-66R-966Z', token: 'TEST-266-432'},
//           KSA: {id: 'TEST-W8W-6WR-846Z', token: 'TEST-206-0b0'},
//         };
//         const {id, token} = config[storedCountry] || {};
//         console.log('CleverTap Config:', {id, token});

//         if (id && token) {
//           CLTModule.raiseEvent(
//             storedCountry.toLowerCase(),
//             id,
//             token,
//             'Login Successful',
//             {testKey: 'testValue'},
//           );
//           console.log('raiseEvent executed successfully on iOS.');

//           CLTModule.callOnUserLogin(storedCountry.toLowerCase(), id, token, {
//             Name: inputValues.name,
//             Identity: inputValues.identity,
//             Email: inputValues.email,
//             Phone: '+91' + inputValues.mobileNumber,
//             disablePromotionalNoti: 'no',
//             'MSG-email': true,
//             'MSG-push': true,
//             'MSG-sms': true,
//             'MSG-whatsapp': true,
//           });
//           console.log('callOnUserLogin executed successfully on iOS.');
//         } else {
//           console.error(
//             'Invalid CleverTap config for the country:',
//             storedCountry,
//           );
//         }
//       }
//     } catch (error) {
//       console.error('Error in CleverTap calls:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>
//       <TextInput
//         style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
//         placeholder="Name"
//         placeholderTextColor="#999"
//         value={inputValues.name}
//         onChangeText={value => handleInputChange('name', value)}
//         onFocus={() => setFocusedInput('name')}
//         onBlur={() => setFocusedInput(null)}
//         textColor="#000"
//       />
//       <TextInput
//         style={[
//           styles.input,
//           focusedInput === 'mobileNumber' && styles.inputFocused,
//         ]}
//         placeholder="Mobile Number"
//         placeholderTextColor="#999"
//         keyboardType="phone-pad"
//         value={inputValues.mobileNumber}
//         onChangeText={value => handleInputChange('mobileNumber', value)}
//         onFocus={() => setFocusedInput('mobileNumber')}
//         onBlur={() => setFocusedInput(null)}
//         textColor="#000"
//       />
//       <TextInput
//         style={[
//           styles.input,
//           focusedInput === 'identity' && styles.inputFocused,
//         ]}
//         placeholder="Identity"
//         placeholderTextColor="#999"
//         value={inputValues.identity}
//         onChangeText={value => handleInputChange('identity', value)}
//         onFocus={() => setFocusedInput('identity')}
//         onBlur={() => setFocusedInput(null)}
//         textColor="#000"
//       />
//       <TextInput
//         style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
//         placeholder="Email ID"
//         placeholderTextColor="#999"
//         keyboardType="email-address"
//         value={inputValues.email}
//         onChangeText={value => handleInputChange('email', value)}
//         onFocus={() => setFocusedInput('email')}
//         onBlur={() => setFocusedInput(null)}
//         textColor="#000"
//       />
//       <TextInput
//         style={[
//           styles.input,
//           focusedInput === 'password' && styles.inputFocused,
//         ]}
//         placeholder="Password"
//         placeholderTextColor="#999"
//         secureTextEntry
//         value={inputValues.password}
//         onChangeText={value => handleInputChange('password', value)}
//         onFocus={() => setFocusedInput('password')}
//         onBlur={() => setFocusedInput(null)}
//         textColor="#000"
//       />
//       <TouchableOpacity style={styles.button} onPress={handleSubmit}>
//         <Text style={styles.buttonText}>Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 16,
//   },
//   title: {
//     fontSize: 25,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//     textAlign: 'center',
//     paddingVertical: 20,
//     color: '#2196f3',
//   },
//   input: {
//     height: 50,
//     borderColor: 'gray',
//     borderWidth: 1,
//     borderRadius: 25,
//     marginBottom: 10,
//     paddingLeft: 16,
//     paddingRight: 16,
//     backgroundColor: '#fff',
//     color: '#000',
//   },
//   inputFocused: {
//     borderColor: '#2196f3',
//     shadowColor: '#2196f3',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   button: {
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#2196f3',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//   },
// });

// export default Login;

import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules} from 'react-native';

const {CTModule, CLTModule} = NativeModules;
const CleverTap = require('clevertap-react-native');

const Login = ({navigation}) => {
  // Initialize CleverTap
  CleverTap.setDebugLevel(3);
  CleverTap.initializeInbox();

  const [inputValues, setInputValues] = useState({
    name: '',
    mobileNumber: '',
    identity: '',
    email: '',
    password: '',
  });

  const [focusedInput, setFocusedInput] = useState(null);

  const handleInputChange = (name, value) => {
    if (name === 'mobileNumber') {
      const digitsOnly = value.replace(/[^0-9]/g, ''); // Only digits
      setInputValues(prevState => ({
        ...prevState,
        mobileNumber: digitsOnly.slice(0, 10), // Max 10 digits
      }));
    } else {
      setInputValues(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    console.log('Input Values:', inputValues);

    const storedCountry =
      (await AsyncStorage.getItem('selectedCountry')) || 'UAE'; // Default to UAE
    console.log('Stored Country:', storedCountry);

    try {
      // Android-specific logic
      if (Platform.OS === 'android' && CTModule) {
        if (CTModule.initCleverTap) {
          CTModule.initCleverTap();
          console.log('CleverTap initialized on Android.');
        }
        CTModule.callOnUserLogin();
        CTModule.resurrectApp();
        console.log('callOnUserLogin executed successfully on Android.');
      }

      // iOS-specific logic
      else if (Platform.OS === 'ios' && CLTModule) {
        const config = {
          UAE: {id: 'TEST-RK4-66R-966Z', token: 'TEST-266-432'},
          KSA: {id: 'TEST-W8W-6WR-846Z', token: 'TEST-206-0b0'},
        };

        const {id, token} = config[storedCountry] || {};
        if (id && token) {
          console.log('CleverTap Config:', {id, token});

          await CLTModule.raiseEvent(
            storedCountry.toLowerCase(),
            id,
            token,
            'Login Successful',
            {testKey: 'testValue'},
          );

          await CLTModule.callOnUserLogin(
            storedCountry.toLowerCase(),
            id,
            token,
            {
              Name: inputValues.name,
              Identity: inputValues.identity,
              Email: inputValues.email,
              Phone: '+91' + inputValues.mobileNumber,
              disablePromotionalNoti: 'no',
              'MSG-email': true,
              'MSG-push': true,
              'MSG-sms': true,
              'MSG-whatsapp': true,
            },
          );

          await CLTModule.setUserDetailsInAppGroups(
            storedCountry.toLowerCase(),
            id,
            token,
            inputValues.email,
            inputValues.identity,
          );

          CLTModule.getUserDetailsFromAppGroups();
        } else {
          throw new Error(
            `Invalid CleverTap config for country: ${storedCountry}`,
          );
        }
      }

      // Navigate to Home on success
      Alert.alert('Success', 'Login Successful!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error in CleverTap calls:', error);
      Alert.alert('Error', 'Failed to process login. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
        placeholder="Name"
        placeholderTextColor="#999"
        value={inputValues.name}
        onChangeText={value => handleInputChange('name', value)}
        onFocus={() => setFocusedInput('name')}
        onBlur={() => setFocusedInput(null)}
      />
      <TextInput
        style={[
          styles.input,
          focusedInput === 'mobileNumber' && styles.inputFocused,
        ]}
        placeholder="Mobile Number"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        value={inputValues.mobileNumber}
        onChangeText={value => handleInputChange('mobileNumber', value)}
        onFocus={() => setFocusedInput('mobileNumber')}
        onBlur={() => setFocusedInput(null)}
      />
      <TextInput
        style={[
          styles.input,
          focusedInput === 'identity' && styles.inputFocused,
        ]}
        placeholder="Identity"
        placeholderTextColor="#999"
        value={inputValues.identity}
        onChangeText={value => handleInputChange('identity', value)}
        onFocus={() => setFocusedInput('identity')}
        onBlur={() => setFocusedInput(null)}
      />
      <TextInput
        style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
        placeholder="Email ID"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={inputValues.email}
        onChangeText={value => handleInputChange('email', value)}
        onFocus={() => setFocusedInput('email')}
        onBlur={() => setFocusedInput(null)}
      />
      <TextInput
        style={[
          styles.input,
          focusedInput === 'password' && styles.inputFocused,
        ]}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={inputValues.password}
        onChangeText={value => handleInputChange('password', value)}
        onFocus={() => setFocusedInput('password')}
        onBlur={() => setFocusedInput(null)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2196f3',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 10,
    paddingLeft: 16,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: '#2196f3',
    shadowColor: '#2196f3',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Login;
