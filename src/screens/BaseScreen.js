import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import CleverTap from 'clevertap-react-native';

const BaseScreen = ({
  navigation,
  screenName,
  screenTitle,
  accentColor,
  icon,
  eventName,
  content,
}) => {
  useEffect(() => {
    console.log(
      `[CleverTap] ${screenName} mounted — recording event: ${eventName}`,
    );
    CleverTap.recordEvent(eventName);
  }, [eventName, screenName]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={accentColor} />
      <View style={[styles.header, {backgroundColor: accentColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, {backgroundColor: accentColor}]}>
          <Text style={styles.heroIcon}>{icon}</Text>
          <Text style={styles.heroTitle}>{screenTitle}</Text>
          <Text style={styles.heroSubtitle}>
            Screen reached via navigation or push notification
          </Text>
        </View>

        <View style={styles.inAppStatusCard}>
          <View style={styles.inAppStatusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.inAppStatusTitle}>InApp Status: Active</Text>
          </View>
          <Text style={styles.inAppStatusDesc}>
            InApp notifications are active on this screen.{'\n'}
            Whether you navigated here normally or via a push notification,
            CleverTap InApps will display without interruption.
          </Text>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>About this screen</Text>
          <Text style={styles.contentBody}>{content}</Text>
        </View>

        <View style={styles.eventCard}>
          <Text style={styles.eventLabel}>CleverTap Event Fired</Text>
          <View style={styles.eventBadge}>
            <Text style={styles.eventName}>{eventName}</Text>
          </View>
          <Text style={styles.eventDesc}>
            Create a CleverTap InApp campaign triggered on this event to see it
            appear when you land on this screen.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.homeButton, {backgroundColor: accentColor}]}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}>
          <Text style={styles.homeButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {fontSize: 20, color: '#ffffff', fontWeight: '600'},
  headerTitle: {fontSize: 18, fontWeight: '700', color: '#ffffff'},
  headerRight: {width: 40},
  content: {padding: 16, paddingBottom: 32},
  heroCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {fontSize: 48, marginBottom: 12},
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  inAppStatusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  inAppStatusRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  inAppStatusTitle: {fontSize: 15, fontWeight: '700', color: '#1A1A1A'},
  inAppStatusDesc: {fontSize: 13, color: '#666666', lineHeight: 20},
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentBody: {fontSize: 14, color: '#444444', lineHeight: 22},
  eventCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  eventLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6A1B9A',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  eventBadge: {
    backgroundColor: '#6A1B9A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  eventName: {
    fontFamily: 'monospace',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  eventDesc: {fontSize: 13, color: '#4A148C', lineHeight: 19},
  homeButton: {borderRadius: 12, padding: 16, alignItems: 'center'},
  homeButtonText: {fontSize: 16, fontWeight: '700', color: '#ffffff'},
});

export default BaseScreen;
