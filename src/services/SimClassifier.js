// src/services/SimClassifier.js
//
// Classifies each SimInfo object as one of:
//   'PRIMARY'    – belongs to the primary operator
//   'COMPETITOR' – a known competitor SIM, not roaming
//   'ROAMING'    – any SIM currently roaming (excluded from all tracking)
//   'OTHER'      – unrecognised operator
//
// Roaming check always runs first and wins.

import {OperatorConfig} from '../config/OperatorConfig';
import {slotLabel} from './SimInfo';

// ─── Public classify function ─────────────────────────────────────────────────

export function classifySims(sims) {
  return sims.map(sim => {
    const role = determineRole(sim);
    return {
      simInfo: sim,
      role,
      displayLabel: buildLabel(sim, role),
    };
  });
}

// ─── Role determination ───────────────────────────────────────────────────────

function determineRole(sim) {
  // 1. Roaming check — always wins
  if (sim.isRoaming) return 'ROAMING';

  // 2. Inactive / empty slot
  if (!sim.isActive) return 'OTHER';

  const name = sim.operatorName.trim().toLowerCase();
  const mccMnc = sim.mccMnc.trim();

  // 3. Primary operator — MCC+MNC first, name as fallback
  const isPrimary =
    OperatorConfig.activePrimaryMccMnc.includes(mccMnc) ||
    OperatorConfig.activePrimaryNames.some(n => name.includes(n));
  if (isPrimary) return 'PRIMARY';

  // 4. Competitor — MCC+MNC first, name as fallback
  const isCompetitor =
    OperatorConfig.activeCompetitorMccMnc.includes(mccMnc) ||
    OperatorConfig.activeCompetitorNames.some(n => name.includes(n));
  if (isCompetitor) return 'COMPETITOR';

  return 'OTHER';
}

// ─── Display label ────────────────────────────────────────────────────────────

function buildLabel(sim, role) {
  const slot = slotLabel(sim);
  const op = sim.operatorName || 'Unknown';
  switch (role) {
    case 'PRIMARY':
      return `${slot}: ${op} (Primary)`;
    case 'COMPETITOR':
      return `${slot}: ${op} (Competitor)`;
    case 'ROAMING':
      return `${slot}: ${op} (Roaming - excluded)`;
    case 'OTHER':
      return `${slot}: ${op} (Other)`;
    default:
      return `${slot}: ${op}`;
  }
}
