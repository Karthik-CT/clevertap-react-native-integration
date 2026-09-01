// src/services/CleverTapService.js
//
// All CleverTap push logic — user profile properties and events.
// Direct port of CleverTapManager.kt with identical roaming guards.
//
// Install SDK: npm install clevertap-react-native
//              cd ios && pod install

import CleverTap from 'clevertap-react-native';
import {slotLabel} from './SimInfo';

// ─── User profile properties ──────────────────────────────────────────────────

export function pushSimUserProperties(classifications) {
  const primary = classifications.find(c => c.role === 'PRIMARY');

  // Whatever SIM physically sits in the secondary slot, regardless of role.
  // Used so we can report the secondary slot's real roaming state even when the
  // SIM is excluded from competitor tracking.
  const secondary = classifications.find(c => c.simInfo.slotIndex === 1);

  // A *trackable* competitor: COMPETITOR role AND not roaming.
  const competitor = classifications.find(
    c => c.role === 'COMPETITOR' && !c.simInfo.isRoaming,
  );

  const profile = {};

  if (primary) {
    profile['sim_primary_operator'] = primary.simInfo.operatorName || 'Unknown';
    profile['sim_primary_mccmnc'] = primary.simInfo.mccMnc;
    profile['sim_primary_country'] = primary.simInfo.countryIso.toUpperCase();
    profile['sim_primary_roaming'] = primary.simInfo.isRoaming;
  }

  if (competitor) {
    profile['sim_secondary_operator'] =
      competitor.simInfo.operatorName || 'Unknown';
    profile['sim_secondary_mccmnc'] = competitor.simInfo.mccMnc;
    profile['sim_secondary_country'] =
      competitor.simInfo.countryIso.toUpperCase();
    profile['sim_secondary_roaming'] = false;
    profile['sim_secondary_is_competitor'] = true;
  } else {
    // Excluded (roaming) or no competitor in the secondary slot.
    profile['sim_secondary_operator'] = '';
    profile['sim_secondary_mccmnc'] = '';
    profile['sim_secondary_country'] = ''; // was left stale before — now cleared
    profile['sim_secondary_is_competitor'] = false;
    // Report the ACTUAL roaming state of whatever is in the secondary slot,
    // even though it is excluded from competitor tracking. This is the value
    // that turns TRUE when you simulate/observe a roaming secondary SIM.
    profile['sim_secondary_roaming'] = secondary
      ? secondary.simInfo.isRoaming
      : false;
  }

  profile['sim_dual_sim_device'] = classifications.length > 1;
  profile['sim_competitor_in_secondary'] = !!competitor;

  // ── Explicit, easy-to-verify roaming signals ──
  // sim_secondary_role : 'primary' | 'competitor' | 'roaming' | 'other' | 'none'
  //   -> becomes 'roaming' when the secondary SIM is roaming.
  // sim_any_roaming    : true if ANY detected SIM (primary or secondary) is roaming.
  profile['sim_secondary_role'] = secondary
    ? roleString(secondary.role)
    : 'none';
  profile['sim_any_roaming'] = classifications.some(c => c.simInfo.isRoaming);

  CleverTap.profileSet(profile);
}

// ─── SIM Detected — fires for every slot including roaming ───────────────────

export function pushSimDetectedEvents(classifications) {
  classifications.forEach(c => {
    CleverTap.recordEvent('SIM Detected', {
      slot: slotLabel(c.simInfo),
      operator: c.simInfo.operatorName || 'Unknown',
      mccmnc: c.simInfo.mccMnc,
      role: roleString(c.role),
      roaming: c.simInfo.isRoaming,
      country: c.simInfo.countryIso.toUpperCase(),
    });
  });
}

// ─── Primary Operator Used ────────────────────────────────────────────────────

export function pushPrimaryOperatorUsed(simInfo, sessionId) {
  CleverTap.recordEvent('Primary Operator Used', {
    operator: simInfo.operatorName || 'Unknown',
    mccmnc: simInfo.mccMnc,
    slot: slotLabel(simInfo),
    session_id: sessionId,
  });
}

// ─── Competitor SIM Used — key tracking event ─────────────────────────────────

export function pushCompetitorSimUsed(simInfo, sessionId) {
  // Hard guard — never fires for roaming SIMs
  if (simInfo.isRoaming) return;

  CleverTap.recordEvent('Competitor SIM Used', {
    operator: simInfo.operatorName || 'Unknown',
    mccmnc: simInfo.mccMnc,
    slot: slotLabel(simInfo),
    country: simInfo.countryIso.toUpperCase(),
    session_id: sessionId,
  });
}

// ─── App Opened with full SIM context ────────────────────────────────────────

export function pushAppOpenedWithSimContext(classifications, sessionId) {
  const primary = classifications.find(c => c.role === 'PRIMARY');
  const competitor = classifications.find(
    c => c.role === 'COMPETITOR' && !c.simInfo.isRoaming,
  );
  const secondary = classifications.find(c => c.simInfo.slotIndex === 1);

  CleverTap.recordEvent('App Opened', {
    session_id: sessionId,
    primary_operator: primary?.simInfo.operatorName ?? 'None',
    competitor_in_secondary: !!competitor,
    competitor_operator: competitor?.simInfo.operatorName ?? 'None',
    total_sims_detected: classifications.length,
    // roaming visibility on the session event (no extra event = no extra MAU)
    secondary_role: secondary ? roleString(secondary.role) : 'none',
    any_roaming: classifications.some(c => c.simInfo.isRoaming),
  });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function roleString(role) {
  switch (role) {
    case 'PRIMARY':
      return 'primary';
    case 'COMPETITOR':
      return 'competitor';
    case 'ROAMING':
      return 'roaming';
    case 'OTHER':
      return 'other';
    default:
      return 'other';
  }
}
