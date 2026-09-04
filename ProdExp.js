import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, Button, StyleSheet, ScrollView} from 'react-native';
import CleverTap from 'clevertap-react-native';

// ooredoo tunisia implementation starts here
let variables = {
  test: {
    enabled: false,
    screen: '',
    url: '',
  },
};
CleverTap.defineVariables(variables);
CleverTap.fetchVariables((err, success) => {
  console.log('fetchVariables result:', success);
  CleverTap.getVariables((err, variables) => {
    console.log('getVariables: ', variables, err);
  });
  CleverTap.getVariable('test', (err, variable) => {
    console.log('test variable:', variable);
  });
});
// ooredoo tunisia implementation ends here

// creating all the variables
const VARIABLE_DEFAULTS = {
  kfc_banner: '',
  kfc_banner_update: {},
  kfc_categories: {},
  kfc_new_arrivals: {},
  offer_banner: {},
  offer_categories: {},
  offer_new_arrivals: {},
  ooredooTest: '',
  pe_coachmarks: {},
  'PE-Demo': '',
  pricing_view: '',
  rakeshTest: '',
  RKTest: '',
  shawarmerTest: '',
  test_var_string: {},
  test_var_string2: {},
  test_var_string3: {},
  test_var_string4: '',
  test_var_string5: '',
  test_var_string6: {},
  theme: '',
  tunisia_offer: '',
  'yelo-test-var1': '',
  // Defining Ooredoo Tunisia variables
  test: {
    enabled: true,
    screen: 'InternetCampaignScreen',
    url: '',
  },
  enabled: false,
  screen: '',
  url: '',
};

const ProdExp = () => {
  const [variables, setVariables] = useState(VARIABLE_DEFAULTS);
  const [status, setStatus] = useState('Not fetched yet');

  const handleFetchVariables = useCallback(() => {
    setStatus('Fetching variables...');
    // Fetching all the variables
    CleverTap.fetchVariables((err, success) => {
      setStatus(
        success
          ? `Fetched from server at ${new Date().toLocaleTimeString()}`
          : `Fetch failed: ${err}`,
      );
    });
  }, []);

  const handleSyncVariables = () => {
    // Syncing the variables
    CleverTap.syncVariables();
    setStatus('Definitions synced to dashboard (debug build only)');
  };

  useEffect(() => {
    // Defining all the variables
    CleverTap.defineVariables(VARIABLE_DEFAULTS);

    // Defining all the variables
    CleverTap.getVariables((err, vars) => {
      if (!err && vars) {
        setVariables(vars);
      }
    });

    CleverTap.onVariablesChanged(vars => {
      setVariables(vars);
      setStatus(`Updated from server at ${new Date().toLocaleTimeString()}`);
    });

    handleFetchVariables();

    return () => {
      CleverTap.removeListener(CleverTap.CleverTapOnVariablesChanged);
    };
  }, [handleFetchVariables]);

  const formatValue = value =>
    typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);

  const flattenVariables = (obj, prefix = '') =>
    Object.entries(obj).reduce((acc, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, flattenVariables(value, path));
      } else {
        acc[path] = value;
      }
      return acc;
    }, {});

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>
        Product Experience — Remote Config
      </Text>
      <Text style={styles.statusText}>{status}</Text>

      <View style={styles.buttonRow}>
        <Button title="Sync Variables (Debug)" onPress={handleSyncVariables} />
        <View style={styles.buttonSpacer} />
        <Button title="Fetch Variables" onPress={handleFetchVariables} />
      </View>

      {Object.entries(flattenVariables(variables)).map(([name, value]) => (
        <View key={name} style={styles.card}>
          <Text style={styles.cardTitle}>{name}</Text>
          <Text style={styles.cardValue}>{formatValue(value)}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  buttonSpacer: {
    width: 12,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1FA3FF',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 14,
    color: '#333',
  },
});

export default ProdExp;
