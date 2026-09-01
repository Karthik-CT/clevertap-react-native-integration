// src/config/OperatorConfig.js
//
// Single file that controls operator classification.
// Flip IS_POC_MODE to switch between POC (India/Jio) and production (Ooredoo).
//
// MCC+MNC reference: https://www.mcc-mnc.com

// ─── POC — India / Jio ───────────────────────────────────────────────────────

const PRIMARY_OPERATOR_MCCMNC_POC = [
  '40486', // Reliance Jio – main
  '405857', // Jio alternate
  '405861', // Jio alternate
];

const PRIMARY_OPERATOR_NAMES_POC = [
  'jio',
  'reliance jio',
  'reliance',
  'jio 4g',
];

const COMPETITOR_MCCMNC_POC = [
  // Airtel
  '40410',
  '40416',
  '40445',
  '40449',
  '40470',
  '40492',
  '40493',
  '40494',
  '40496',
  '40501',
  '405799',
  // Vi (Vodafone-Idea)
  '40420',
  '40427',
  '40430',
  '40443',
  '40460',
  '40484',
  '40487',
  '40488',
  '40489',
  '40495',
  '405845',
  '405846',
  // BSNL
  '40471',
  '40474',
  '40475',
  '40476',
  '40477',
  '40734',
  '40735',
  // MTNL
  '40456',
  '40468',
];

const COMPETITOR_NAMES_POC = [
  'airtel',
  'bharti airtel',
  'vi',
  'vodafone',
  'idea',
  'vodafone in',
  'vi india',
  'bsnl',
  'mtnl',
];

// ─── PRODUCTION — Ooredoo markets ────────────────────────────────────────────
// Replace the arrays below with your actual operator codes before going live.

const PRIMARY_OPERATOR_MCCMNC_PROD = [
  '42701', // Ooredoo Qatar
  '41902', // Ooredoo Kuwait
  '60502', // Ooredoo Tunisia
  '60303', // Ooredoo Algeria
  '41409', // Ooredoo Myanmar
  '47202', // Ooredoo Maldives
  '42505', // Ooredoo Palestine
  '41805', // Asiacell Iraq
  '51001',
  '51021', // Indosat Ooredoo Indonesia
  '42203', // Ooredoo Oman
];

const PRIMARY_OPERATOR_NAMES_PROD = [
  'ooredoo',
  'asiacell',
  'indosat',
  'indosat ooredoo',
  'wataniya',
  'nedjma',
];

const COMPETITOR_MCCMNC_PROD = [
  '42702', // Zain Qatar
  '41904', // Zain Kuwait
  '42004', // Zain Saudi Arabia
  '41801', // Zain Iraq
  '42604', // Zain Bahrain
  '41603', // Zain Jordan
  '42402', // e& / Etisalat UAE
  '42403', // du UAE
  '42001', // STC Saudi Arabia
  '41903', // STC Kuwait
  '42601', // STC Bahrain / Viva Bahrain
  '42703', // Vodafone Qatar
  '41905', // Viva Kuwait
  '42605', // Viva Bahrain
  '42003', // Mobily Saudi Arabia
  '42202', // Omantel Oman
];

const COMPETITOR_NAMES_PROD = [
  'zain',
  'etisalat',
  'e&',
  'du',
  'stc',
  'saudi telecom',
  'vodafone qatar',
  'viva',
  'mobily',
  'omantel',
  'batelco',
];

// ─── Active mode flag ────────────────────────────────────────────────────────
// true  = India / Jio POC
// false = Ooredoo production

export const IS_POC_MODE = true;

export const OperatorConfig = {
  activePrimaryMccMnc: IS_POC_MODE
    ? PRIMARY_OPERATOR_MCCMNC_POC
    : PRIMARY_OPERATOR_MCCMNC_PROD,
  activePrimaryNames: IS_POC_MODE
    ? PRIMARY_OPERATOR_NAMES_POC
    : PRIMARY_OPERATOR_NAMES_PROD,
  activeCompetitorMccMnc: IS_POC_MODE
    ? COMPETITOR_MCCMNC_POC
    : COMPETITOR_MCCMNC_PROD,
  activeCompetitorNames: IS_POC_MODE
    ? COMPETITOR_NAMES_POC
    : COMPETITOR_NAMES_PROD,
};
