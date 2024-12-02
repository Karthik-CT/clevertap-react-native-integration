import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';

const CleverTap = require('clevertap-react-native');

const Login = ({navigation}) => {
  CleverTap.setDebugLevel(3);
  CleverTap.initializeInbox();

  const [inputValues, setInputValues] = useState({
    name: '',
    mobileNumber: '',
    identity: '',
    email: '',
    password: '',
  });

  const [focusedInput, setFocusedInput] = useState(null); // Track focused input

  const handleInputChange = (name, value) => {
    if (name === 'mobileNumber') {
      // Remove non-digit characters
      const digitsOnly = value.replace(/[^0-9]/g, '');
      // Allow only the first 10 digits
      setInputValues(prevState => ({
        ...prevState,
        mobileNumber: digitsOnly.slice(0, 10),
      }));
    } else {
      setInputValues(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = () => {
    // Log all the values entered in the input text
    console.log(inputValues);

    // Optionally, you can show an alert with the input values
    Alert.alert('Logged Values', JSON.stringify(inputValues));

    // Redirect to Home Page
    navigation.navigate('Home');

    CleverTap.onUserLogin({
      Name: inputValues.name,
      Identity: inputValues.identity,
      Email: inputValues.email,
      Phone: '+91' + inputValues.mobileNumber,
      disablePromotionalNoti: 'no',
      'MSG-email': true,
      'MSG-push': true,
      'MSG-sms': true,
      'MSG-whatsapp': true,
    });
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
        // Set text color to black for visibility
        textColor="#000"
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
        textColor="#000"
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
        textColor="#000"
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
        textColor="#000"
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
        textColor="#000"
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
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: 20,
    color: '#2196f3',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 25, // Oval-shaped inputs
    marginBottom: 10, // Margin between inputs
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: '#fff', // Optional: Background color
    placeholderTextColor: '#999', // Lighter placeholder text
    color: '#000', // Set text color to black for visibility
  },
  inputFocused: {
    borderColor: '#2196f3', // Blue border when focused
    shadowColor: '#2196f3', // Subtle shadow for focus
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2, // Shadow for Android
  },
  button: {
    height: 50,
    borderRadius: 25, // Oval-shaped button
    backgroundColor: '#2196f3', // Button color
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, // Margin between inputs and button
  },
  buttonText: {
    color: '#fff', // Text color
    fontSize: 18,
  },
});

export default Login;
