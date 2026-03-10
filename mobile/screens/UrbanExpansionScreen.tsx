import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AnalysisResponse } from '../types';

interface UrbanExpansionScreenProps {
  route: {
    params: {
      data: AnalysisResponse;
    };
  };
  navigation: any;
}

export default function UrbanExpansionScreen({ route, navigation }: UrbanExpansionScreenProps) {
  const { data } = route.params;

  // Add null safety check
  if (!data || !data.urbanExpansion || !data.urbanExpansion.zones) {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.errorText}>No data available. Please run an analysis first.</Text>
        </View>
      </View>
    );
  }

  const getGrowthColor = (pixels: number) => {
    if (pixels > 150) return '#dc2626';
    if (pixels > 100) return '#f59e0b';
    if (pixels > 50) return '#facc15';
    return '#22c55e';
  };

  const getGrowthLabel = (pixels: number) => {
    if (pixels > 150) return 'Very High';
    if (pixels > 100) return 'High';
    if (pixels > 50) return 'Moderate';
    return 'Low';
  };

  // Calculate growth rate for each zone relative to largest
  const maxPixels = Math.max(...data.urbanExpansion.zones.map(z => z.pixels), 1);
  const getZoneGrowthRate = (pixels: number) => (pixels / maxPixels) * 20;

  return (
    <ScrollView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.headerCard}>
          <Text style={styles.headerLabel}>Growth Rate</Text>
          <Text style={styles.headerValue}>{(data.urbanExpansion?.urbanGrowthRate ?? 0).toFixed(1)}%</Text>
        </View>
        <View style={styles.headerCard}>
          <Text style={styles.headerLabel}>Urban Zones</Text>
          <Text style={styles.headerValue}>{data.urbanExpansion?.zones?.length ?? 0}</Text>
        </View>
        <View style={styles.headerCard}>
          <Text style={styles.headerLabel}>Pixels Converted</Text>
          <Text style={styles.headerValue}>
            {data.urbanExpansion?.pixelsConverted ?? 0}
          </Text>
        </View>
      </View>

      {/* Zones List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Urban Growth Zones</Text>
        
        {data.urbanExpansion.zones.map((zone, index) => (
          <View key={zone.id} style={styles.zoneCard}>
            <View style={styles.zoneHeader}>
              <View style={styles.zoneIcon}>
                <Text style={styles.zoneIconText}>🏙️</Text>
              </View>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{zone.area}</Text>
                <Text style={styles.zoneCoords}>
                  📍 {zone.location[0].toFixed(2)}°N, {zone.location[1].toFixed(2)}°E
                </Text>
              </View>
              <View
                style={[
                  styles.growthBadge,
                  { backgroundColor: getGrowthColor(zone.pixels) },
                ]}
              >
                <Text style={styles.growthText}>
                  {getGrowthLabel(zone.pixels)}
                </Text>
              </View>
            </View>

            <View style={styles.zoneStats}>
              <View style={styles.zoneStat}>
                <Text style={styles.zoneStatLabel}>Development Area</Text>
                <Text style={styles.zoneStatValue}>
                  {((zone.pixels * 100) / 1000000).toFixed(2)} km²
                </Text>
                <Text style={styles.zoneStatSubtext}>
                  {(zone.pixels * 100).toLocaleString()} m²
                </Text>
              </View>
              <View style={styles.zoneStat}>
                <Text style={styles.zoneStatLabel}>Pixels</Text>
                <Text style={[
                  styles.zoneStatValue,
                  { color: getGrowthColor(zone.pixels) }
                ]}>
                  {zone.pixels}
                </Text>
                <Text style={styles.zoneStatSubtext}>
                  Relative: {getZoneGrowthRate(zone.pixels).toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(zone.pixels / maxPixels) * 100}%`,
                    backgroundColor: getGrowthColor(zone.pixels),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Impact Analysis */}
      <View style={styles.impactSection}>
        <Text style={styles.sectionTitle}>Environmental Impact</Text>
        
        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Text style={styles.impactIcon}>🌡️</Text>
            <Text style={styles.impactTitle}>Heat Island Effect</Text>
          </View>
          <Text style={styles.impactText}>
            Urban expansion increases surface temperatures by 2-5°C in developed areas, 
            affecting local climate patterns.
          </Text>
        </View>

        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Text style={styles.impactIcon}>💧</Text>
            <Text style={styles.impactTitle}>Water Runoff</Text>
          </View>
          <Text style={styles.impactText}>
            Concrete surfaces reduce water absorption, increasing flood risk during 
            monsoon season by up to 40% in highly developed zones.
          </Text>
        </View>

        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Text style={styles.impactIcon}>🌳</Text>
            <Text style={styles.impactTitle}>Green Cover Loss</Text>
          </View>
          <Text style={styles.impactText}>
            Urban development replaces forests and agricultural land, reducing carbon 
            absorption and biodiversity in Tamil Nadu.
          </Text>
        </View>
      </View>

      {/* Additional Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 What does this mean?</Text>
        <Text style={styles.infoText}>
          These zones show where cities and towns are expanding the most. While development 
          is necessary, rapid urban growth without proper planning can harm the environment. 
          The growth rate shows how fast each area is expanding compared to previous years.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  headerCard: {
    flex: 1,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  headerLabel: {
    fontSize: 10,
    color: '#92400e',
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#78350f',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  zoneCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  zoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  zoneIconText: {
    fontSize: 20,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  zoneCoords: {
    fontSize: 12,
    color: '#64748b',
  },
  growthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  zoneStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  zoneStat: {
    flex: 1,
  },
  zoneStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  zoneStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  zoneStatSubtext: {
    fontSize: 10,
    color: '#cbd5e1',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  impactSection: {
    padding: 16,
    paddingTop: 0,
  },
  impactCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  impactText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    padding: 20,
  },
});
