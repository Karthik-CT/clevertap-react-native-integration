// src/components/SimCardItem.jsx

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {slotLabel} from '../services/SimInfo';

const ROLE_COLORS = {
  PRIMARY: '#1A73E8',
  COMPETITOR: '#E53935',
  ROAMING: '#FF8F00',
  OTHER: '#757575',
};

const ROLE_LABELS = {
  PRIMARY: 'PRIMARY',
  COMPETITOR: 'COMPETITOR',
  ROAMING: 'ROAMING (Excluded)',
  OTHER: 'OTHER',
};

export default function SimCardItem({item}) {
  const roleColor = ROLE_COLORS[item.role] ?? '#757575';

  return (
    <View style={styles.card}>
      {/* Left colour strip */}
      <View style={[styles.roleStrip, {backgroundColor: roleColor}]} />

      <View style={styles.content}>
        {/* Slot + roaming badge row */}
        <View style={styles.row}>
          <Text style={styles.slotLabel}>{slotLabel(item.simInfo)}</Text>
          <Text style={styles.roamingBadge}>
            {item.simInfo.isRoaming ? '🌍 Roaming' : '📍 Home'}
          </Text>
        </View>

        {/* Operator name */}
        <Text style={[styles.operatorName, {color: roleColor}]}>
          {item.simInfo.operatorName || 'Unknown Operator'}
        </Text>

        {/* Role badge */}
        <View style={[styles.roleBadge, {backgroundColor: roleColor}]}>
          <Text style={styles.roleBadgeText}>{ROLE_LABELS[item.role]}</Text>
        </View>

        {/* MCC+MNC and country */}
        <View style={styles.row}>
          <Text style={styles.meta}>
            MCC+MNC: {item.simInfo.mccMnc || 'N/A'}
          </Text>
          <Text style={styles.meta}>
            Country: {item.simInfo.countryIso.toUpperCase() || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  roleStrip: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  roamingBadge: {
    fontSize: 12,
    color: '#757575',
  },
  operatorName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    color: '#616161',
    fontFamily: 'monospace',
    marginTop: 6,
  },
});
