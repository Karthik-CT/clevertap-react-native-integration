// src/services/SimReader.js
//
// Reads active SIM subscriptions using react-native-sim-cards-manager.
// Returns an array of SimInfo objects sorted by slot index.
//
// IMPORTANT: We use getSimCardsNative() instead of getSimCards().
// getSimCards() internally calls PermissionsAndroid.request() with a
// permission string that resolves to null on many RN/Android combinations,
// causing the "permission is null" fatal crash. getSimCardsNative() skips
// the library's permission handling entirely — we manage it ourselves here
// using hardcoded permission strings to avoid the same null issue.
//
// Library: https://github.com/odemolliens/react-native-sim-cards-manager
// Install: npm install react-native-sim-cards-manager
//          cd ios && pod install
//
// ─── FIELD-NAME NOTE (this is what was broken) ────────────────────────────────
// The library returns these Android keys per SIM:
//   carrierName, displayName, isoCountryCode, mobileCountryCode,
//   mobileNetworkCode, isNetworkRoaming, isDataRoaming, simSlotIndex,
//   phoneNumber, simSerialNumber, subscriptionId
// It does NOT return `mcc`, `mnc`, `countryCode`, or `simState`.
// The previous port read those non-existent keys, so mccMnc/countryIso came
// back empty (→ "N/A") and isActive was always false (→ everything "OTHER").
// getSimCardsNative() is backed by SubscriptionManager.getActiveSubscriptionInfoList(),
// so every entry it returns is already an ACTIVE subscription.

import SimCardsManager from 'react-native-sim-cards-manager';
import {PermissionsAndroid, Platform} from 'react-native';

// Hardcoded strings — never goes through PermissionsAndroid.PERMISSIONS
// which can return null on certain RN versions.
const PERM_PHONE_STATE = 'android.permission.READ_PHONE_STATE';
const PERM_PHONE_NUMBERS = 'android.permission.READ_PHONE_NUMBERS'; // required Android 11+

// ─── Permission request ───────────────────────────────────────────────────────
// We handle permissions ourselves so we never touch the library's broken
// internal permission flow that causes the null crash.

export async function requestPhonePermission() {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    // Build the list of permissions we need based on API level
    const needed =
      Platform.Version >= 30
        ? [PERM_PHONE_STATE, PERM_PHONE_NUMBERS]
        : [PERM_PHONE_STATE];

    // Check which ones still need to be requested
    const toRequest = [];
    for (const perm of needed) {
      const alreadyGranted = await PermissionsAndroid.check(perm);
      if (!alreadyGranted) {
        toRequest.push(perm);
      }
    }

    // All already granted
    if (toRequest.length === 0) {
      return true;
    }

    // requestMultiple works for both 1 and 2 permissions
    const results = await PermissionsAndroid.requestMultiple(toRequest);

    return Object.values(results).every(
      r => r === PermissionsAndroid.RESULTS.GRANTED,
    );
  } catch (error) {
    console.warn('[SimReader] Permission request failed:', error);
    return false;
  }
}

// ─── Main read function ───────────────────────────────────────────────────────

export async function readSims() {
  if (Platform.OS !== 'android') {
    // iOS does not expose SIM slot details
    return [];
  }

  const granted = await requestPhonePermission();
  if (!granted) {
    console.warn('[SimReader] Permission not granted');
    return [];
  }

  try {
    // getSimCardsNative() does NOT handle permissions internally — it
    // goes straight to the native SubscriptionManager call. This is what
    // we want since we have already handled permissions above ourselves.
    const cards = await SimCardsManager.getSimCardsNative();

    if (!cards || cards.length === 0) {
      return [];
    }

    // Helpful when verifying field names on a real device:
    // console.log('[SimReader] raw cards:', JSON.stringify(cards, null, 2));

    return cards
      .sort((a, b) => (a.simSlotIndex ?? 0) - (b.simSlotIndex ?? 0))
      .map((card, index) => buildSimInfo(card, index));
  } catch (error) {
    console.warn('[SimReader] Failed to read SIM cards:', error);
    return [];
  }
}

// ─── Builder ──────────────────────────────────────────────────────────────────

function buildSimInfo(card, fallbackIndex) {
  // The library uses mobileCountryCode / mobileNetworkCode / isoCountryCode.
  // We keep `card.mcc` / `card.mnc` / `card.countryCode` as *fallbacks* only,
  // in case a future library version or a custom native fork exposes them.
  const mcc = String(card.mobileCountryCode ?? card.mcc ?? '').trim();
  const mnc = String(card.mobileNetworkCode ?? card.mnc ?? '').trim();

  // Pad MNC to at least 2 digits to match standard MCC+MNC format
  // (SubscriptionInfo.getMnc() can drop a leading zero, e.g. 05 -> 5).
  const paddedMnc = mnc.length === 1 ? mnc.padStart(2, '0') : mnc;
  const mccMnc = mcc && mnc ? `${mcc}${paddedMnc}` : '';

  return {
    slotIndex: card.simSlotIndex ?? fallbackIndex,
    operatorName: String(card.carrierName ?? card.displayName ?? '').trim(),
    mccMnc,
    countryIso: String(card.isoCountryCode ?? card.countryCode ?? '')
      .toLowerCase()
      .trim(),
    isRoaming: Boolean(card.isNetworkRoaming ?? false),
    // getSimCardsNative() returns only active subscriptions
    // (SubscriptionManager.getActiveSubscriptionInfoList()), and the library
    // exposes no sim-state field. So every returned entry is active by
    // definition. The old `simState === 5` check read a non-existent key,
    // making this false for every SIM and forcing every role to OTHER.
    isActive: true,
  };
}
