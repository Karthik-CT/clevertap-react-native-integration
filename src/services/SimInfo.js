// src/services/SimInfo.js
//
// Helper functions for SIM info objects.
// A SimInfo object has the shape:
// {
//   slotIndex:    number,   0 = SIM1, 1 = SIM2
//   operatorName: string,   e.g. "Jio"
//   mccMnc:       string,   e.g. "40486"
//   countryIso:   string,   e.g. "in"
//   isRoaming:    boolean,
//   isActive:     boolean,  true when SIM state is READY (state === 5)
// }

export function slotLabel(sim) {
  return sim.slotIndex === 0 ? 'Primary SIM' : 'Secondary SIM';
}