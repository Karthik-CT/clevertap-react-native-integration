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
// ─── FIELD-NAME NOTE ──────────────────────────────────────────────────────────
// The library returns these Android keys per SIM:
//   carrierName, displayName, isoCountryCode, mobileCountryCode,
//   mobileNetworkCode, isNetworkRoaming, isDataRoaming, simSlotIndex,
//   phoneNumber, simSerialNumber, subscriptionId
// It does NOT return `mcc`, `mnc`, `countryCode`, or `simState`.
// getSimCardsNative() is backed by SubscriptionManager.getActiveSubscriptionInfoList(),
// so every entry it returns is already an ACTIVE subscription.

import SimCardsManager from 'react-native-sim-cards-manager';
import {PermissionsAndroid, Platform} from 'react-native';
import {applySimDebugOverrides} from '../config/SimDebugConfig';

// Hardcoded strings — never goes through PermissionsAndroid.PERMISSIONS
// which can return null on certain RN versions.
const PERM_PHONE_STATE = 'android.permission.READ_PHONE_STATE';
const PERM_PHONE_NUMBERS = 'android.permission.READ_PHONE_NUMBERS'; // required Android 11+

// ─── Permission request ───────────────────────────────────────────────────────

export async function requestPhonePermission() {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const needed =
      Platform.Version >= 30
        ? [PERM_PHONE_STATE, PERM_PHONE_NUMBERS]
        : [PERM_PHONE_STATE];

    const toRequest = [];
    for (const perm of needed) {
      const alreadyGranted = await PermissionsAndroid.check(perm);
      if (!alreadyGranted) {
        toRequest.push(perm);
      }
    }

    if (toRequest.length === 0) {
      return true;
    }

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
  let realSims = [];

  if (Platform.OS === 'android') {
    const granted = await requestPhonePermission();
    if (granted) {
      try {
        // getSimCardsNative() does NOT handle permissions internally — it
        // goes straight to the native SubscriptionManager call, which is fine
        // because we already handled permissions above ourselves.
        const cards = await SimCardsManager.getSimCardsNative();

        // Uncomment to verify raw field names on a real device:
        // console.log('[SimReader] raw cards:', JSON.stringify(cards, null, 2));

        if (cards && cards.length > 0) {
          realSims = cards
            .sort((a, b) => (a.simSlotIndex ?? 0) - (b.simSlotIndex ?? 0))
            .map((card, index) => buildSimInfo(card, index));
        }
      } catch (error) {
        console.warn('[SimReader] Failed to read SIM cards:', error);
      }
    } else {
      console.warn('[SimReader] Permission not granted');
    }
  }
  // iOS does not expose SIM slot details, so realSims stays empty there.

  // Apply test-only overrides. This is a no-op unless SimDebugConfig.enabled
  // is true, so it is safe to leave in place. When enabled it can force
  // roaming, patch fields, or inject synthetic SIMs (even on an emulator /
  // iOS with no physical SIM).
  return applySimDebugOverrides(realSims);
}

// ─── Builder ──────────────────────────────────────────────────────────────────

function buildSimInfo(card, fallbackIndex) {
  // The library uses mobileCountryCode / mobileNetworkCode / isoCountryCode.
  // Keep mcc / mnc / countryCode as fallbacks only, for other library forks.
  const mcc = String(card.mobileCountryCode ?? card.mcc ?? '').trim();
  const mnc = String(card.mobileNetworkCode ?? card.mnc ?? '').trim();

  // Pad MNC to at least 2 digits (getMnc() can drop a leading zero, 05 -> 5).
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
    // Every entry from getSimCardsNative() is an active subscription.
    isActive: true,
  };
}
