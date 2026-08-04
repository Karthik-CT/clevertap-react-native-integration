import React, {useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
// NOTE: use SafeAreaView / insets from react-native-safe-area-context, NOT from
// 'react-native'. The RN core SafeAreaView is iOS-only and applies no insets on
// Android, which is why the refresh button was sitting under the system nav bar.
// react-native-safe-area-context is already installed if you use react-navigation
// (the "SimTrackerScreen" native header in the screenshot implies you do).
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSimTracker} from './src/hooks/useSimTracker';
import SimCardItem from './src/components/SimCardItem';
import {IS_POC_MODE} from './src/config/OperatorConfig';

export default function SimTrackerScreen() {
  const {classifications, statusMessage, isLoading, loadAndTrackSims} =
    useSimTracker();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadAndTrackSims();
  }, [loadAndTrackSims]);

  const modeLabel = IS_POC_MODE
    ? 'POC MODE — India (Jio / Airtel / Vi / BSNL)'
    : 'PRODUCTION MODE — Ooredoo Markets';

  return (
    // edges={['top']} keeps the blue header clear of the status bar without
    // adding a grey strip at the bottom; we handle the bottom inset manually
    // on the refresh button below.
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#1557B0" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SIM Tracker — CleverTap POC</Text>
        <Text style={styles.headerSubtitle}>{modeLabel}</Text>
      </View>

      {/* Progress indicator */}
      {isLoading && (
        <View style={styles.progressBar}>
          <ActivityIndicator color="#1A73E8" size="small" />
        </View>
      )}

      {/* SIM card list */}
      <FlatList
        data={classifications}
        keyExtractor={item => String(item.simInfo.slotIndex)}
        renderItem={({item}) => <SimCardItem item={item} />}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>
              No SIM cards detected. Grant READ_PHONE_STATE permission and
              refresh.
            </Text>
          ) : null
        }
      />

      {/* Status log panel */}
      <View style={styles.statusBox}>
        <ScrollView>
          <Text style={styles.statusText}>
            {statusMessage || 'Initialising…'}
          </Text>
        </ScrollView>
      </View>

      {/* Refresh button — pad the bottom by the system nav-bar inset so the
          label is never hidden behind the Android navigation bar. */}
      <TouchableOpacity
        style={[
          styles.refreshButton,
          {paddingBottom: 18 + insets.bottom},
          isLoading && styles.refreshButtonDisabled,
        ]}
        onPress={loadAndTrackSims}
        disabled={isLoading}>
        <Text style={styles.refreshButtonText}>
          🔄 Refresh & Push to CleverTap
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1A73E8',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#E3F2FD',
    fontSize: 12,
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 40,
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  statusBox: {
    height: 160,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  statusText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#212121',
    padding: 12,
    lineHeight: 18,
  },
  refreshButton: {
    // height removed — vertical padding + bottom inset now define the size so
    // the button always clears the system navigation bar.
    paddingTop: 18,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonDisabled: {
    backgroundColor: '#90B8F8',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
