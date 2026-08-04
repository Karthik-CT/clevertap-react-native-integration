// src/config/SimDebugConfig.js
//
// ⚠️  TEST-ONLY OVERRIDES  ⚠️
// Lets you simulate roaming (and dual-SIM setups) without physically being in
// roaming. These overrides are applied inside SimReader.readSims(), right after
// the real SIMs are read and BEFORE classification — so the classifier, the
// competitor guards in useSimTracker, and the roaming guard in CleverTapService
// all behave exactly as they would with a genuine roaming SIM.
//
// 🚨 SET `enabled` BACK TO false BEFORE SHIPPING. 🚨
// While enabled, a warning is logged on every read so it can't sneak into prod.

export const SimDebugConfig = {
  // ── Master switch. Nothing below runs unless this is true. ──
  enabled: false,

  // 1. FORCE ROAMING
  //    Flip existing SIMs into roaming while keeping their real operator/MCC-MNC.
  //    Slot 0 = Primary SIM, slot 1 = Secondary SIM.
  //    Example below forces your real secondary (Vi) into roaming so you can
  //    confirm it gets classified ROAMING and excluded everywhere.
  forceRoamingSlots: [1],

  // 2. PATCH FIELDS BY SLOT (optional, for richer scenarios)
  //    Override any field on a real SIM, keyed by slotIndex. Handy to pretend a
  //    SIM is on a FOREIGN network so the roaming details look realistic.
  //    Uncomment to simulate the secondary SIM roaming on Vodafone UK:
  patchBySlot: {
    // 1: {
    //   operatorName: 'Vodafone UK',
    //   mccMnc: '23415',
    //   countryIso: 'gb',
    //   isRoaming: true,
    // },
  },

  // 3. INJECT SYNTHETIC SIMs (optional)
  //    Append fully fake SIMs — useful if you only have ONE physical SIM but
  //    want to test a dual-SIM roaming case. Missing fields get safe defaults.
  //    If injectReplacesRealSlot is true, a fake SIM replaces a real one that
  //    has the same slotIndex; otherwise it's appended.
  injectSims: [
    // {
    //   slotIndex: 1,
    //   operatorName: 'Vi India',
    //   mccMnc: '40420',   // a competitor code — but roaming, so must be excluded
    //   countryIso: 'in',
    //   isRoaming: true,
    //   isActive: true,
    // },
  ],
  injectReplacesRealSlot: true,
};

// ─── Applied by SimReader — do not call from anywhere else ─────────────────────

export function applySimDebugOverrides(sims) {
  const cfg = SimDebugConfig;
  if (!cfg || !cfg.enabled) {
    return sims;
  }

  console.warn(
    '[SimDebug] ⚠️ DEBUG SIM OVERRIDES ARE ACTIVE — set SimDebugConfig.enabled = false before release.',
  );

  // Work on copies so we never mutate the objects the library handed us.
  let result = (sims || []).map(s => ({...s}));

  // 1. Force roaming on the listed slots.
  //    Coerce to Number on both sides in case the native module returns
  //    simSlotIndex as a string ("1"), which would otherwise never match.
  if (Array.isArray(cfg.forceRoamingSlots) && cfg.forceRoamingSlots.length) {
    const roamingSlots = cfg.forceRoamingSlots.map(Number);
    result = result.map(s =>
      roamingSlots.includes(Number(s.slotIndex)) ? {...s, isRoaming: true} : s,
    );
  }

  // 2. Patch arbitrary fields by slot
  if (cfg.patchBySlot && typeof cfg.patchBySlot === 'object') {
    result = result.map(s => {
      const patch = cfg.patchBySlot[s.slotIndex];
      return patch ? {...s, ...patch} : s;
    });
  }

  // 3. Inject synthetic SIMs
  if (Array.isArray(cfg.injectSims) && cfg.injectSims.length) {
    cfg.injectSims.forEach(raw => {
      const sim = normalizeSim(raw);
      const idx = result.findIndex(s => s.slotIndex === sim.slotIndex);
      if (idx >= 0 && cfg.injectReplacesRealSlot) {
        result[idx] = sim;
      } else {
        result.push(sim);
      }
    });
  }

  // Keep the array sorted by slot, same as SimReader does for real SIMs.
  result.sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));

  console.warn(
    '[SimDebug] Effective SIMs after overrides:',
    JSON.stringify(result, null, 2),
  );

  return result;
}

// Fill in safe defaults so injected entries don't need every field.
function normalizeSim(partial) {
  return {
    slotIndex: partial.slotIndex ?? 1,
    operatorName: String(partial.operatorName ?? '').trim(),
    mccMnc: String(partial.mccMnc ?? '').trim(),
    countryIso: String(partial.countryIso ?? '')
      .toLowerCase()
      .trim(),
    isRoaming: Boolean(partial.isRoaming ?? false),
    isActive: partial.isActive ?? true,
  };
}
