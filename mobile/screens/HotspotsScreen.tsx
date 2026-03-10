import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { AnalysisResponse } from '../types';

interface HotspotsScreenProps {
  route: {
    params: {
      data: AnalysisResponse;
    };
  };
  navigation: any;
}

export default function HotspotsScreen({ route, navigation }: HotspotsScreenProps) {
  const { data } = route.params;

  // Add null safety check
  if (!data || !data.deforestation || !data.deforestation.hotspots) {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.errorText}>No data available. Please run an analysis first.</Text>
        </View>
      </View>
    );
  }

  const getSeverityColor = (index: number) => {
    if (index === 0) return '#dc2626';
    if (index < 3) return '#f59e0b';
    return '#facc15';
  };

  const getSeverityLabel = (index: number) => {
    if (index === 0) return 'Critical';
    if (index < 3) return 'High';
    return 'Moderate';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.headerCard}>
          <Text style={styles.headerLabel}>Total Hotspots</Text>
          <Text style={styles.headerValue}>{data.deforestation?.hotspotsFound ?? 0}</Text>
        </View>
        <View style={styles.headerCard}>
          <Text style={styles.headerLabel}>Area Lost</Text>
          <Text style={styles.headerValue}>{(data.deforestation?.areaLost ?? 0).toFixed(1)}%</Text>
        </View>
      </View>

      {/* Hotspots List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Critical Areas in Tamil Nadu</Text>
        
        {data.deforestation.hotspots.map((hotspot, index) => (
          <View key={hotspot.id} style={styles.hotspotCard}>
            <View style={styles.hotspotHeader}>
              <View style={styles.hotspotRank}>
                <Text style={styles.hotspotRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.hotspotInfo}>
                <Text style={styles.hotspotLocation}>{hotspot.area}</Text>
                <Text style={styles.hotspotCoords}>
                  📍 {hotspot.location[0].toFixed(2)}°N, {hotspot.location[1].toFixed(2)}°E
                </Text>
              </View>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(index) },
                ]}
              >
                <Text style={styles.severityText}>
                  {getSeverityLabel(index)}
                </Text>
              </View>
            </View>
            
            <View style={styles.hotspotStats}>
              <View style={styles.hotspotStat}>
                <Text style={styles.hotspotStatLabel}>Affected Area</Text>
                <Text style={styles.hotspotStatValue}>
                  {(hotspot.pixels * 100).toLocaleString()} m²
                </Text>
              </View>
              <View style={styles.hotspotStat}>
                <Text style={styles.hotspotStatLabel}>Pixels</Text>
                <Text style={styles.hotspotStatValue}>
                  {hotspot.pixels.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(hotspot.pixels / data.deforestation.hotspots[0].pixels) * 100}%`,
                    backgroundColor: getSeverityColor(index),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Additional Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 What does this mean?</Text>
        <Text style={styles.infoText}>
          These are the areas in Tamil Nadu where forests are being cut down the most. 
          The higher the ranking, the more urgent the problem. The "affected area" shows 
          how many square meters of forest were lost in each location.
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
    gap: 12,
  },
  headerCard: {
    flex: 1,
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  headerLabel: {
    fontSize: 12,
    color: '#991b1b',
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f1d1d',
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
  hotspotCard: {
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
  hotspotHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hotspotRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hotspotRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
  },
  hotspotInfo: {
    flex: 1,
  },
  hotspotLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  hotspotCoords: {
    fontSize: 12,
    color: '#64748b',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  hotspotStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  hotspotStat: {
    flex: 1,
  },
  hotspotStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  hotspotStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
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
