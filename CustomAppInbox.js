import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Linking,
  Alert,
  Modal,
  AppState,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import CleverTap from 'clevertap-react-native';

// Tabs shown under the header. Filtering matches a tab against a message's
// CleverTap dashboard tags (see tabMatchesTag below), so no tab-to-tag
// mapping needs to be hardcoded per-campaign.
const TABS = ['All', 'Smart Alerts', 'Offers', 'Reminders'];

// Colour treatment for the small tag chip on each card, keyed by a fragment
// of the CleverTap dashboard tag name (matched case-insensitively).
const TAG_STYLES = {
  reminder: {bg: '#E3ECFB', color: '#3B6FE0'},
  offer: {bg: '#FFF3D6', color: '#C98A0B'},
  payment: {bg: '#FDE3EA', color: '#C2185B'},
  'smart alert': {bg: '#F0E6FB', color: '#7C4DBE'},
};
const DEFAULT_TAG_STYLE = {bg: '#EEEEEE', color: '#6B6B6B'};

function getTagStyle(tag) {
  if (!tag) {
    return DEFAULT_TAG_STYLE;
  }
  const key = tag.toLowerCase();
  const match = Object.keys(TAG_STYLES).find(
    k => key.includes(k) || k.includes(key),
  );
  return match ? TAG_STYLES[match] : DEFAULT_TAG_STYLE;
}

// Exact match only (case-insensitive, underscores/hyphens treated as
// spaces so "smart_alerts", "smart-alerts" and "Smart Alerts" all match) —
// no substring/fuzzy matching. A message only belongs to a specific tab
// when one of its tags is literally that tab's tag; everything still shows
// under "All" regardless of tags.
const TAB_TAG_ALIASES = {
  'Smart Alerts': ['smart alert', 'smart alerts'],
  Offers: ['offer', 'offers'],
  Reminders: ['reminder', 'reminders'],
};

function normalizeTag(tag) {
  return String(tag || '')
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function tabMatchesTag(tab, tag) {
  if (tab === 'All') {
    return true;
  }
  if (!tag) {
    return false;
  }
  const aliases = TAB_TAG_ALIASES[tab] || [];
  return aliases.includes(normalizeTag(tag));
}

function formatDate(epochSeconds) {
  if (!epochSeconds) {
    return '';
  }
  const d = new Date(epochSeconds * 1000);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const day = String(d.getDate()).padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// The primary CTA ("View Offers ›") can come either as a single action URL
// or as the first entry of the "links" array, depending on how the campaign
// was built on the dashboard. Try both shapes defensively.
function extractPrimaryLink(content) {
  const action = content.action || {};
  if (action.hasLinks && Array.isArray(action.links) && action.links.length) {
    const link = action.links[0] || {};
    const text =
      (typeof link.text === 'string' && link.text) ||
      (link.text && link.text.text) ||
      'View Offers';
    const url =
      (link.url && link.url.android && link.url.android.text) ||
      (typeof link.url === 'string' && link.url) ||
      null;
    return {text, url};
  }
  if (action.hasUrl) {
    const url =
      (action.url && action.url.android && action.url.android.text) ||
      content.actionUrl ||
      null;
    return {text: 'View Offers', url};
  }
  return {text: null, url: null};
}

// Raw shape of a message returned by CleverTap.getAllInboxMessages, per the
// native CTInboxMessage/CTInboxMessageContent classes:
// { id, date, isRead, tags: [...], msg: { content: [{ title:{text,color},
// message:{text,color}, media:{url,content_type}, icon:{url}, action:{...} }],
// custom_kv: [{ key, value: { text } }, ...] } }
function parseInboxMessage(raw) {
  const msg = raw.msg || {};
  const content = (Array.isArray(msg.content) && msg.content[0]) || {};

  const title = (content.title && content.title.text) || '';
  const body = (content.message && content.message.text) || '';
  const mediaUrl = (content.media && content.media.url) || null;
  const mediaType = (content.media && content.media.content_type) || '';
  const isImage =
    !!mediaUrl && (mediaType === '' || mediaType.startsWith('image'));

  const {text: linkText, url: linkUrl} = extractPrimaryLink(content);

  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  // Custom key-value pairs added on the dashboard when the campaign was
  // created. Rendered generically below — whatever comes through gets
  // shown, nothing here is tied to a specific campaign's key names.
  const customKvList = Array.isArray(msg.custom_kv) ? msg.custom_kv : [];
  const customKvValues = customKvList
    .map(kv => (kv && kv.key ? (kv.value && kv.value.text) || '' : null))
    .filter(v => v !== null && v !== '');

  return {
    id: raw.id != null ? String(raw.id) : '',
    date: raw.date || 0,
    isRead: !!raw.isRead,
    tags,
    tag: tags[0] || null,
    title,
    body,
    imageUrl: isImage ? mediaUrl : null,
    linkText,
    linkUrl,
    customKvValues,
  };
}

function TabChip({label, active, badgeCount, onPress}) {
  return (
    <View style={styles.tabWrapper}>
      <TouchableOpacity
        style={[styles.tabChip, active && styles.tabChipActive]}
        hitSlop={{top: 10, bottom: 10, left: 6, right: 6}}
        activeOpacity={0.7}
        onPress={onPress}>
        <Text style={[styles.tabText, active && styles.tabTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
      {badgeCount > 0 ? (
        <View style={styles.tabBadge} pointerEvents="none">
          <Text style={styles.tabBadgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function InboxCard({item, onOpen, onDelete}) {
  const tagStyle = getTagStyle(item.tag);
  const [numberValue, labelValue] = item.customKvValues;

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        {item.imageUrl ? (
          <Image
            source={{uri: item.imageUrl}}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.date ? (
              <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
            ) : null}
          </View>

          {item.body ? (
            <Text style={styles.cardMessage} numberOfLines={3}>
              {item.body}
            </Text>
          ) : null}

          <View style={styles.cardFooterRow}>
            {item.linkText ? (
              <TouchableOpacity
                style={styles.viewOffersButton}
                onPress={() => onOpen(item)}>
                <Text style={styles.viewOffersText}>{item.linkText} ›</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.viewOffersButton} />
            )}

            {item.tag ? (
              <View style={[styles.tagChip, {backgroundColor: tagStyle.bg}]}>
                <Text style={[styles.tagChipText, {color: tagStyle.color}]}>
                  {item.tag}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(item)}>
              <Text style={styles.deleteIcon}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {numberValue ? (
        <View style={styles.kvRow}>
          <Text style={styles.kvIcon}>👤</Text>
          <Text style={styles.kvText} numberOfLines={1}>
            For {numberValue}
            {labelValue ? ` (${labelValue})` : ''}
          </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Switch Number', 'Feature coming soon.')
            }>
            <Text style={styles.kvAction}>Switch Number</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

function PushPermissionPrompt({visible, onClose, onGoToSettings}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.promptOverlay}>
        <View style={styles.promptCard}>
          <TouchableOpacity style={styles.promptCloseButton} onPress={onClose}>
            <Text style={styles.promptCloseIcon}>✕</Text>
          </TouchableOpacity>

          <View style={styles.promptIconCircle}>
            <Text style={styles.promptIconText}>!</Text>
          </View>

          <Text style={styles.promptTitle}>
            Enable Push Notifications to never miss any deals!
          </Text>
          <Text style={styles.promptSubtitle}>
            For best experience of the My Ooredoo App, enable your notification
            to never miss any deals!
          </Text>

          <TouchableOpacity
            style={styles.promptButton}
            onPress={onGoToSettings}>
            <Text style={styles.promptButtonText}>Go To Settings</Text>
          </TouchableOpacity>

          <View style={styles.promptHandle} />
        </View>
      </View>
    </Modal>
  );
}

export default function CustomAppInbox() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [pushPermissionGranted, setPushPermissionGranted] = useState(true);
  const [pushPromptDismissed, setPushPromptDismissed] = useState(false);
  const viewedIdsRef = useRef(new Set());

  const checkPushPermission = useCallback(() => {
    CleverTap.isPushPermissionGranted((err, res) => {
      if (!err) {
        setPushPermissionGranted(!!res);
      }
    });
  }, []);

  useEffect(() => {
    checkPushPermission();
    // Re-check whenever the app comes back to the foreground, e.g. after the
    // user enables the permission from the phone's Settings app and returns.
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        checkPushPermission();
      }
    });
    return () => subscription.remove();
  }, [checkPushPermission]);

  const handleGoToPushSettings = useCallback(() => {
    // true = if permission is denied, CleverTap routes the user to the
    // app's notification settings page (works on both Android and iOS).
    CleverTap.promptForPushPermission(true);
  }, []);

  const loadMessages = useCallback(() => {
    CleverTap.getAllInboxMessages((err, res) => {
      if (!err && Array.isArray(res)) {
        setMessages(res.map(parseInboxMessage));
      }
      setLoading(false);
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    CleverTap.initializeInbox();
    CleverTap.addListener(
      CleverTap.CleverTapInboxMessagesDidUpdate,
      loadMessages,
    );
    loadMessages();
    return () => {
      CleverTap.removeListener(CleverTap.CleverTapInboxMessagesDidUpdate);
    };
  }, [loadMessages]);

  // Fire the "viewed" analytics event once per message the first time it
  // appears in the rendered list.
  useEffect(() => {
    messages.forEach(item => {
      if (item.id && !viewedIdsRef.current.has(item.id)) {
        viewedIdsRef.current.add(item.id);
        CleverTap.pushInboxNotificationViewedEventForId(item.id);
      }
    });
  }, [messages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    CleverTap.fetchInbox(() => {
      loadMessages();
    });
  }, [loadMessages]);

  const handleOpen = useCallback(item => {
    CleverTap.pushInboxNotificationClickedEventForId(item.id);
    if (!item.isRead) {
      CleverTap.markReadInboxMessageForId(item.id);
    }
    if (item.linkUrl) {
      Linking.openURL(item.linkUrl).catch(() => {});
    }
  }, []);

  const handleDelete = useCallback(item => {
    Alert.alert(
      'Delete message',
      'Are you sure you want to delete this message?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            CleverTap.deleteInboxMessageForId(item.id);
            setMessages(prev => prev.filter(m => m.id !== item.id));
          },
        },
      ],
    );
  }, []);

  const filteredMessages = useMemo(
    () =>
      messages.filter(item =>
        activeTab === 'All'
          ? true
          : item.tags.some(tag => tabMatchesTag(activeTab, tag)),
      ),
    [messages, activeTab],
  );

  // Unread count per tab, shown as a badge on the tab chip. Only tabs with
  // at least one matching unread message get a badge at all.
  const tabUnreadCounts = useMemo(() => {
    const counts = {};
    TABS.forEach(tab => {
      if (tab === 'All') {
        return;
      }
      counts[tab] = messages.filter(
        item => !item.isRead && item.tags.some(tag => tabMatchesTag(tab, tag)),
      ).length;
    });
    return counts;
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerSide}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>APP INBOX</Text>
        <TouchableOpacity
          style={[styles.headerSide, styles.headerSideRight]}
          onPress={() =>
            Alert.alert('Support', 'Contact support - feature coming soon.')
          }>
          <Text style={styles.supportIcon}>🎧</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        <View style={styles.tabsRowContent}>
          {TABS.map(tab => (
            <TabChip
              key={tab}
              label={tab}
              active={tab === activeTab}
              badgeCount={tabUnreadCounts[tab]}
              onPress={() => setActiveTab(tab)}
            />
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8323B" />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filteredMessages}
          extraData={activeTab}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <InboxCard
              item={item}
              onOpen={handleOpen}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E8323B']}
              tintColor="#E8323B"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
            </View>
          }
        />
      )}

      <PushPermissionPrompt
        visible={!pushPermissionGranted && !pushPromptDismissed}
        onClose={() => setPushPromptDismissed(true)}
        onGoToSettings={handleGoToPushSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerSide: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSideRight: {
    marginLeft: 'auto',
  },
  backIcon: {
    fontSize: 30,
    color: '#111111',
    marginTop: -2,
  },
  supportIcon: {
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: 0.5,
    marginLeft: -44,
  },
  tabsRow: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tabsRowContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabWrapper: {
    marginRight: 10,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tabChipActive: {
    backgroundColor: '#E8323B',
    borderColor: '#E8323B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7C4DBE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8A8A8A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#EDEDED',
  },
  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#161616',
  },
  cardDate: {
    fontSize: 11,
    color: '#9A9A9A',
    marginLeft: 8,
    marginTop: 1,
  },
  cardMessage: {
    fontSize: 12.5,
    color: '#6B6B6B',
    marginTop: 4,
    lineHeight: 17,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  viewOffersButton: {
    flex: 1,
  },
  viewOffersText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E8323B',
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 2,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#9A9A9A',
  },
  kvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  kvIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  kvText: {
    flex: 1,
    fontSize: 12,
    color: '#6B6B6B',
  },
  kvAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E8323B',
    textDecorationLine: 'underline',
    marginLeft: 8,
  },
  promptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // was 'center'
  },
  promptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 28,
    paddingBottom: 32, // extra bottom padding for home-indicator / gesture area
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  promptCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptCloseIcon: {
    fontSize: 16,
    color: '#9A9A9A',
  },
  promptIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  promptIconText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  promptSubtitle: {
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  promptButton: {
    width: '100%',
    backgroundColor: '#E8323B',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  promptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  promptHandle: {
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDDDDD',
    marginTop: 16,
  },
});
