import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeModules} from 'react-native';

const {CTModule, CLTModule} = NativeModules;

const Country = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const pickerItems = [
    {label: 'UAE', value: 'UAE'},
    {label: 'KSA', value: 'KSA'},
  ];

  useEffect(() => {
    const checkCountry = async () => {
      try {
        const storedCountry = await AsyncStorage.getItem('selectedCountry');
        if (storedCountry) {
          initializeCleverTap(storedCountry);
          navigation.replace('Login');
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching country:', error);
        setIsLoading(false);
      }
    };

    checkCountry();
  }, [navigation]);

  const handleSelection = async value => {
    if (!value) return;

    try {
      setSelectedValue(value);
      await AsyncStorage.setItem('selectedCountry', value);

      initializeCleverTap(value);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error in handleSelection:', error);
    }
  };

  initializeCleverTap = country => {
    try {
      if (Platform.OS === 'android' && CTModule?.initCleverTap) {
        CTModule.initCleverTap(country);
        CTModule.resurrectApp();
      } else if (Platform.OS === 'ios' && CLTModule) {
        const config = {
          UAE: {id: 'TEST-RK4-66R-966Z', token: 'TEST-266-432'},
          KSA: {id: 'TEST-W8W-6WR-846Z', token: 'TEST-206-0b0'},
        };
        const {id, token} = config[country] || {};
        CLTModule.initializeCleverTap(country.toLowerCase(), id, token);
      }
    } catch (error) {}
  };

  if (isLoading) {
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
        onValueChange={handleSelection}
        items={pickerItems}
        placeholder={{label: 'Select Country...', value: null}}
        style={pickerSelectStyles}
      />
      <Text style={styles.selectionText}>
        {selectedValue
          ? `You selected: ${selectedValue}`
          : 'No country selected'}
      </Text>
      <TouchableOpacity
        style={[styles.button, !selectedValue && {backgroundColor: '#b0bec5'}]}
        onPress={() => handleSelection(selectedValue)}
        disabled={!selectedValue}>
        <Text style={styles.buttonText}>GO TO LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e3f2fd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e88e5',
    marginBottom: 20,
  },
  selectionText: {
    fontSize: 18,
    marginVertical: 20,
    color: '#333',
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
    backgroundColor: '#e3f2fd',
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
    borderColor: '#1e88e5',
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
