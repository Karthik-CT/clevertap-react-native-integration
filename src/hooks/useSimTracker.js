// src/hooks/useSimTracker.js
//
// Custom hook — port of SimViewModel.kt.
// Orchestrates SIM reading, classification, and all CleverTap pushes.

import {useState, useCallback} from 'react';
import {readSims} from '../services/SimReader';
import {classifySims} from '../services/SimClassifier';
import {
  pushSimUserProperties,
  pushSimDetectedEvents,
  pushPrimaryOperatorUsed,
  pushCompetitorSimUsed,
  pushAppOpenedWithSimContext,
} from '../services/CleverTapService';

// Stable session ID for this app launch
const SESSION_ID = Math.random().toString(36).substring(2, 10);

export function useSimTracker() {
  const [classifications, setClassifications] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadAndTrackSims = useCallback(async () => {
    setIsLoading(true);

    try {
      // Step 1 — Read raw SIM data
      const rawSims = await readSims();

      if (rawSims.length === 0) {
        setStatusMessage('No active SIM cards found or permission denied.');
        setIsLoading(false);
        return;
      }

      // Step 2 — Classify
      const result = classifySims(rawSims);
      setClassifications(result);

      // Step 3 — Push to CleverTap
      pushSimUserProperties(result);
      pushSimDetectedEvents(result);

      const primary = result.find(c => c.role === 'PRIMARY');
      if (primary) {
        pushPrimaryOperatorUsed(primary.simInfo, SESSION_ID);
      }

      const competitor = result.find(
        c => c.role === 'COMPETITOR' && !c.simInfo.isRoaming,
      );
      if (competitor) {
        pushCompetitorSimUsed(competitor.simInfo, SESSION_ID);
      }

      pushAppOpenedWithSimContext(result, SESSION_ID);

      setStatusMessage(buildSummary(result));
    } catch (error) {
      setStatusMessage(`Error reading SIM cards: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    classifications,
    statusMessage,
    isLoading,
    sessionId: SESSION_ID,
    loadAndTrackSims,
  };
}

// ─── Summary text for the status panel ───────────────────────────────────────

function buildSummary(classifications) {
  const lines = [`Session: ${SESSION_ID}\n`];
  classifications.forEach(c => lines.push(`• ${c.displayLabel}`));

  const hasCompetitor = classifications.some(
    c => c.role === 'COMPETITOR' && !c.simInfo.isRoaming,
  );
  lines.push(
    hasCompetitor
      ? '\n✅ Competitor SIM detected — event pushed to CleverTap.'
      : '\nℹ️ No competitor SIM in secondary slot.',
  );
  return lines.join('\n');
}
