import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { forestWatchAPI } from '../api';
import { AnalysisResponse } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [startYear, setStartYear] = useState(2000);
  const [endYear, setEndYear] = useState(2026);

  const handleRunAnalysis = async () => {
    setLoading(true);
    try {
      console.log('Starting analysis...');
      const result = await forestWatchAPI.runAnalysis({ startYear, endYear });
      console.log('Analysis result received:', result);
      setData(result);
      Alert.alert('Success', 'Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to run analysis. Make sure the backend server is running on port 8000.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌲 Forest Watch</Text>
        <Text style={styles.subtitle}>Tamil Nadu Monitoring</Text>
      </View>

      {/* Analysis Controls */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Run New Analysis</Text>
        <Text style={styles.label}>Period: {startYear} → {endYear}</Text>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRunAnalysis}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🔍 Run Analysis</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Overview Cards */}
      {data && (
        <>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardRed]}>
              <Text style={styles.statLabel}>Forest Loss</Text>
              <Text style={styles.statValue}>{data?.visualChange?.vegetationLoss?.toFixed(1) ?? '0.0'}%</Text>
              <Text style={styles.statSubtext}>
                {((data?.visualChange?.vegetationLossPixels ?? 0) * 100).toLocaleString()} m²
              </Text>
            </View>

            <View style={[styles.statCard, styles.statCardPurple]}>
              <Text style={styles.statLabel}>Urban Growth</Text>
              <Text style={styles.statValue}>{data?.visualChange?.urbanExpansion?.toFixed(1) ?? '0.0'}%</Text>
              <Text style={styles.statSubtext}>
                {((data?.visualChange?.urbanExpansionPixels ?? 0) * 100).toLocaleString()} m²
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardOrange]}>
              <Text style={styles.statLabel}>Risk Score</Text>
              <Text style={styles.statValue}>{data?.risk?.score?.toFixed(1) ?? '0.0'}/100</Text>
              <Text style={styles.statSubtext}>{data?.risk?.level ?? 'N/A'}</Text>
            </View>

            <View style={[styles.statCard, styles.statCardBlue]}>
              <Text style={styles.statLabel}>Hotspots</Text>
              <Text style={styles.statValue}>{data?.deforestation?.hotspotsFound ?? 0}</Text>
              <Text style={styles.statSubtext}>Areas detected</Text>
            </View>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>View Details</Text>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Hotspots', { data })}
            >
              <Text style={styles.navButtonIcon}>🔥</Text>
              <View style={styles.navButtonContent}>
                <Text style={styles.navButtonTitle}>Deforestation Hotspots</Text>
                <Text style={styles.navButtonSubtitle}>
                  {data?.deforestation?.hotspotsFound ?? 0} critical areas
                </Text>
              </View>
              <Text style={styles.navButtonArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('UrbanExpansion', { data })}
            >
              <Text style={styles.navButtonIcon}>🏙️</Text>
              <View style={styles.navButtonContent}>
                <Text style={styles.navButtonTitle}>Urban Expansion</Text>
                <Text style={styles.navButtonSubtitle}>
                  {data?.urbanExpansion?.expansionZones ?? 0} growth zones
                </Text>
              </View>
              <Text style={styles.navButtonArrow}>›</Text>
            </TouchableOpacity>

            {data?.prediction && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigation.navigate('Prediction', { data })}
              >
                <Text style={styles.navButtonIcon}>🤖</Text>
                <View style={styles.navButtonContent}>
                  <Text style={styles.navButtonTitle}>AI Predictions</Text>
                  <Text style={styles.navButtonSubtitle}>
                    Forecast for {data?.prediction?.projectedYear ?? 'N/A'}
                  </Text>
                </View>
                <Text style={styles.navButtonArrow}>›</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.navigate('Details', { data })}
            >
              <Text style={styles.navButtonIcon}>📊</Text>
              <View style={styles.navButtonContent}>
                <Text style={styles.navButtonTitle}>Detailed Metrics</Text>
                <Text style={styles.navButtonSubtitle}>
                  Indices, land cover & more
                </Text>
              </View>
              <Text style={styles.navButtonArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {!data && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            👆 Run an analysis to view monitoring data
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e3a5f',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#93c5fd',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statCardRed: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  statCardPurple: {
    backgroundColor: '#faf5ff',
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  statCardOrange: {
    backgroundColor: '#fff7ed',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  statCardBlue: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: '#94a3b8',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  navButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  navButtonContent: {
    flex: 1,
  },
  navButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  navButtonSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  navButtonArrow: {
    fontSize: 32,
    color: '#cbd5e1',
    fontWeight: '300',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
