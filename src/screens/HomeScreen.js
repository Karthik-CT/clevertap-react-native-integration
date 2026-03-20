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

const HomeScreen = ({navigation}) => {
  useEffect(() => {
    console.log('[CleverTap] HomeScreen mounted — recording event');
    CleverTap.recordEvent('Home Screen Viewed');
  }, []);

  const navButtons = [
    {
      label: '🛍  Screen 1 — Products',
      screen: 'Screen1',
      color: '#4A90E2',
      description: 'Product listing screen',
    },
    {
      label: '👤  Screen 2 — Profile',
      screen: 'Screen2',
      color: '#7B68EE',
      description: 'User profile screen',
    },
    {
      label: '📦  Screen 3 — Orders',
      screen: 'Screen3',
      color: '#50C878',
      description: 'Order history screen',
    },
    {
      label: '⚙️  Screen 4 — Settings',
      screen: 'Screen4',
      color: '#FF8C00',
      description: 'App settings screen',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>▶ InApp Active</Text>
        </View>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome to CleverTap POC</Text>
        <Text style={styles.welcomeSubtitle}>
          InApp notifications are now active.{'\n'}
          Any queued InApps from App Launch will display here.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.buttonContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Navigate to Screens</Text>

        {navButtons.map(btn => (
          <TouchableOpacity
            key={btn.screen}
            style={[styles.navButton, {backgroundColor: btn.color}]}
            onPress={() => {
              console.log(`[Nav] Navigating to ${btn.screen}`);
              navigation.navigate(btn.screen);
            }}
            activeOpacity={0.85}>
            <Text style={styles.navButtonLabel}>{btn.label}</Text>
            <Text style={styles.navButtonDesc}>{btn.description}</Text>
            <Text style={styles.navButtonArrow}>→</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Push Notification Flow</Text>
          <Text style={styles.infoText}>
            When this app is opened via a push notification, the app navigates
            directly to the target screen — bypassing Splash.{'\n\n'}
            Since <Text style={styles.infoCode}>
              suspendInAppNotifications
            </Text>{' '}
            is only called in SplashScreen, InApps display normally on the
            push-destination screen without any delay.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {fontSize: 24, fontWeight: '700', color: '#1A1A1A'},
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#81C784',
  },
  badgeText: {color: '#2E7D32', fontSize: 12, fontWeight: '600'},
  welcomeCard: {
    backgroundColor: '#C4283C',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  buttonContainer: {paddingHorizontal: 16, paddingBottom: 32},
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 4,
  },
  navButton: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  navButtonLabel: {fontSize: 16, fontWeight: '700', color: '#ffffff', flex: 1},
  navButtonDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    position: 'absolute',
    bottom: 10,
    left: 18,
  },
  navButtonArrow: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '300',
  },
  infoBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 8,
  },
  infoText: {fontSize: 13, color: '#5D4037', lineHeight: 20},
  infoCode: {
    fontFamily: 'monospace',
    backgroundColor: '#FFE082',
    paddingHorizontal: 3,
    borderRadius: 3,
    fontSize: 12,
  },
});

export default HomeScreen;
