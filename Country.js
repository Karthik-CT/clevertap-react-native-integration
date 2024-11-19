import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {useNavigation} from '@react-navigation/native';
import {NativeModules} from 'react-native';

const {CTModule} = NativeModules;

const Country = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const navigation = useNavigation();

  // Dropdown values
  const pickerItems = [
    {label: 'UAE', value: 'UAE'},
    {label: 'KSA', value: 'KSA'},
  ];

  // Handle selection
  const handleSelection = value => {
    setSelectedValue(value);
    console.log('Selected Value:', value); // Print the selected value
  };

  // Navigate to login page
  const goToLogin = () => {
    CTModule.initCleverTap(selectedValue);
    CTModule.resurrectApp();
    navigation.navigate('Login'); // Navigate to the "Login" screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Country</Text>

      <RNPickerSelect
        onValueChange={value => handleSelection(value)}
        items={pickerItems}
        placeholder={{
          label: 'Select Country...',
          value: null,
        }}
        style={pickerSelectStyles}
      />

      <Text style={styles.selectionText}>
        {selectedValue
          ? `You selected: ${selectedValue}`
          : 'No country selected'}
      </Text>

      <TouchableOpacity style={styles.button} onPress={goToLogin}>
        <Text style={styles.buttonText}>GO TO LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styling for the picker and other elements
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e3f2fd', // Soft background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e88e5', // Title color
    marginBottom: 20,
  },
  selectionText: {
    fontSize: 18,
    marginVertical: 20,
    color: '#333', // Dark text color
  },
  button: {
    backgroundColor: '#1e88e5',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 20,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#1e88e5', // Border color to match the button
    fontSize: 16,
    color: '#333',
  },
  inputIOS: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 20,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#1e88e5',
    fontSize: 16,
    color: '#333',
  },
});

export default Country;
