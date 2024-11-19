import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const { CTModule } = NativeModules;

const Country = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const navigation = useNavigation();

  // Dropdown values
  const pickerItems = [
    { label: 'UAE', value: 'UAE' },
    { label: 'KSA', value: 'KSA' },
  ];

  // Check if a country is already selected (added improved logic to handle initial screen rendering)
  useEffect(() => {
    const checkCountry = async () => {
      const storedCountry = await AsyncStorage.getItem('selectedCountry');
      if (storedCountry) {
        // If country is already selected, initialize CleverTap and navigate to Login
        initializeCleverTap(storedCountry);
        navigation.replace('Login');
      } else {
        // If no country is selected, stop the loading state
        setIsLoading(false);
      }
    };

    // Call checkCountry immediately after the component mounts
    checkCountry();
  }, [navigation]); // Ensure the navigation hook doesn't change on re-renders

  // Save selected country and navigate to Login
  const handleSelection = async (value) => {
    if (value) {
      setSelectedValue(value);
      await AsyncStorage.setItem('selectedCountry', value); // Persist the selected country
      console.log('Selected Value:', value); // Debugging log
      initializeCleverTap(value); // Initialize CleverTap with selected country
      navigation.replace('Login'); // Immediately navigate to Login
    }
  };

  // Initialize CleverTap with the selected country
  const initializeCleverTap = (country) => {
    if (CTModule && CTModule.initCleverTap) {
      CTModule.initCleverTap(country);
      CTModule.resurrectApp();
      console.log(`CleverTap initialized for country: ${country}`);
    } else {
      console.error('CleverTap initialization failed. Check CTModule setup.');
    }
  };

  if (isLoading) {
    // Display a loading spinner while checking country
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Country</Text>

      <RNPickerSelect
        onValueChange={(value) => handleSelection(value)}
        items={pickerItems}
        placeholder={{
          label: 'Select Country...',
          value: null,
        }}
        style={pickerSelectStyles}
      />

      <Text style={styles.selectionText}>
        {selectedValue ? `You selected: ${selectedValue}` : 'No country selected'}
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          !selectedValue && { backgroundColor: '#b0bec5' }, // Disable button if no country selected
        ]}
        onPress={() => handleSelection(selectedValue)} // Trigger selection when the button is pressed
        disabled={!selectedValue} // Disable if no selection
      >
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd', // Same background color as the main screen
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
