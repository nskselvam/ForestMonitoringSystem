import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AnalysisResponse } from '../types';

interface DetailsScreenProps {
  route: {
    params: {
      data: AnalysisResponse;
    };
  };
  navigation: any;
}

export default function DetailsScreen({ route, navigation }: DetailsScreenProps) {
  const { data } = route.params;

  // Add null safety check
  if (!data || !data.landCover || !data.indices) {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.errorText}>No data available. Please run an analysis first.</Text>
        </View>
      </View>
    );
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    if (Math.abs(value) < 1) return '#64748b';
    return value > 0 ? '#22c55e' : '#dc2626';
  };

  // Calculate percentage changes from actual data
  const vegetationChange = (data.landCover.year2?.vegetation ?? 0) - (data.landCover.year1?.vegetation ?? 0);
  const builtUpChange = (data.landCover.year2?.builtUp ?? 0) - (data.landCover.year1?.builtUp ?? 0);
  const waterChange = (data.landCover.year2?.water ?? 0) - (data.landCover.year1?.water ?? 0);
  const barrenChange = (data.landCover.year2?.barren ?? 0) - (data.landCover.year1?.barren ?? 0);

  return (
    <ScrollView style={styles.container}>
      {/* Satellite Indices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📡 Satellite Indices</Text>
        
        <View style={styles.indexCard}>
          <View style={styles.indexHeader}>
            <Text style={styles.indexName}>NDVI (Vegetation Index)</Text>
            <Text style={styles.indexInfo}>ℹ️</Text>
          </View>
          <Text style={styles.indexDescription}>
            Measures plant health and density using near-infrared light reflection
          </Text>
          
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonYear}>Year 1</Text>
              <Text style={styles.comparisonValue}>
                {(data.indices?.ndvi?.year1 ?? 0).toFixed(3)}
              </Text>
              <View style={styles.valueBar}>
                <View 
                  style={[
                    styles.valueBarFill,
                    { 
                      width: `${(data.indices?.ndvi?.year1 ?? 0) * 100}%`,
                      backgroundColor: '#22c55e'
                    }
                  ]}
                />
              </View>
            </View>
            
            <Text style={styles.comparisonArrow}>→</Text>
            
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonYear}>Year 2</Text>
              <Text style={styles.comparisonValue}>
                {(data.indices?.ndvi?.year2 ?? 0).toFixed(3)}
              </Text>
              <View style={styles.valueBar}>
                <View 
                  style={[
                    styles.valueBarFill,
                    { 
                      width: `${(data.indices?.ndvi?.year2 ?? 0) * 100}%`,
                      backgroundColor: '#22c55e'
                    }
                  ]}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.changeIndicator}>
            <Text style={styles.changeLabel}>Change:</Text>
            <Text style={[
              styles.changeValue,
              { color: getChangeColor(data.indices?.ndvi?.change ?? 0) }
            ]}>
              {formatPercentage(data.indices?.ndvi?.change ?? 0)}
            </Text>
          </View>
        </View>

        <View style={styles.indexCard}>
          <View style={styles.indexHeader}>
            <Text style={styles.indexName}>NDBI (Built-up Index)</Text>
            <Text style={styles.indexInfo}>ℹ️</Text>
          </View>
          <Text style={styles.indexDescription}>
            Identifies urban and developed areas by analyzing surface reflectance
          </Text>
          
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonYear}>Year 1</Text>
              <Text style={styles.comparisonValue}>
                {(data.indices?.ndbi?.year1 ?? 0).toFixed(3)}
              </Text>
              <View style={styles.valueBar}>
                <View 
                  style={[
                    styles.valueBarFill,
                    { 
                      width: `${Math.abs(data.indices?.ndbi?.year1 ?? 0) * 100}%`,
                      backgroundColor: '#f59e0b'
                    }
                  ]}
                />
              </View>
            </View>
            
            <Text style={styles.comparisonArrow}>→</Text>
            
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonYear}>Year 2</Text>
              <Text style={styles.comparisonValue}>
                {(data.indices?.ndbi?.year2 ?? 0).toFixed(3)}
              </Text>
              <View style={styles.valueBar}>
                <View 
                  style={[
                    styles.valueBarFill,
                    { 
                      width: `${Math.abs(data.indices?.ndbi?.year2 ?? 0) * 100}%`,
                      backgroundColor: '#f59e0b'
                    }
                  ]}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.changeIndicator}>
            <Text style={styles.changeLabel}>Change:</Text>
            <Text style={[
              styles.changeValue,
              { color: getChangeColor(data.indices?.ndbi?.change ?? 0) }
            ]}>
              {formatPercentage(data.indices?.ndbi?.change ?? 0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Land Cover Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Land Cover Analysis</Text>
        
        <View style={styles.landCoverCard}>
          <View style={styles.landCoverRow}>
            <Text style={styles.landCoverLabel}>🌲 Vegetation</Text>
            <View style={styles.landCoverValues}>
              <Text style={styles.landCoverYear1}>
                {(data.landCover.year1?.vegetation ?? 0).toFixed(1)}%
              </Text>
              <Text style={styles.landCoverArrow}>→</Text>
              <Text style={styles.landCoverYear2}>
                {(data.landCover.year2?.vegetation ?? 0).toFixed(1)}%
              </Text>
              <Text style={[
                styles.landCoverChange,
                { color: getChangeColor(vegetationChange) }
              ]}>
                ({formatPercentage(vegetationChange)})
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${data.landCover.year2?.vegetation ?? 0}%`,
                  backgroundColor: '#22c55e'
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.landCoverCard}>
          <View style={styles.landCoverRow}>
            <Text style={styles.landCoverLabel}>🏙️ Built-up Areas</Text>
            <View style={styles.landCoverValues}>
              <Text style={styles.landCoverYear1}>
                {(data.landCover.year1?.builtUp ?? 0).toFixed(1)}%
              </Text>
              <Text style={styles.landCoverArrow}>→</Text>
              <Text style={styles.landCoverYear2}>
                {(data.landCover.year2?.builtUp ?? 0).toFixed(1)}%
              </Text>
              <Text style={[
                styles.landCoverChange,
                { color: getChangeColor(builtUpChange) }
              ]}>
                ({formatPercentage(builtUpChange)})
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${data.landCover.year2?.builtUp ?? 0}%`,
                  backgroundColor: '#f59e0b'
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.landCoverCard}>
          <View style={styles.landCoverRow}>
            <Text style={styles.landCoverLabel}>💧 Water Bodies</Text>
            <View style={styles.landCoverValues}>
              <Text style={styles.landCoverYear1}>
                {(data.landCover.year1?.water ?? 0).toFixed(1)}%
              </Text>
              <Text style={styles.landCoverArrow}>→</Text>
              <Text style={styles.landCoverYear2}>
                {(data.landCover.year2?.water ?? 0).toFixed(1)}%
              </Text>
              <Text style={[
                styles.landCoverChange,
                { color: getChangeColor(waterChange) }
              ]}>
                ({formatPercentage(waterChange)})
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${data.landCover.year2?.water ?? 0}%`,
                  backgroundColor: '#3b82f6'
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.landCoverCard}>
          <View style={styles.landCoverRow}>
            <Text style={styles.landCoverLabel}>🏜️ Barren Land</Text>
            <View style={styles.landCoverValues}>
              <Text style={styles.landCoverYear1}>
                {(data.landCover.year1?.barren ?? 0).toFixed(1)}%
              </Text>
              <Text style={styles.landCoverArrow}>→</Text>
              <Text style={styles.landCoverYear2}>
                {(data.landCover.year2?.barren ?? 0).toFixed(1)}%
              </Text>
              <Text style={[
                styles.landCoverChange,
                { color: getChangeColor(barrenChange) }
              ]}>
                ({formatPercentage(barrenChange)})
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${data.landCover.year2?.barren ?? 0}%`,
                  backgroundColor: '#94a3b8'
                }
              ]}
            />
          </View>
        </View>
      </View>

      {/* Visual Change */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Overall Change Summary</Text>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Visual Change Score</Text>
            <Text style={styles.summaryValue}>
              {(data.visualChange?.totalChange ?? 0).toFixed(1)}%
            </Text>
          </View>
          <Text style={styles.summaryDescription}>
            Combined measure of all land cover changes detected
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📚 Understanding the Metrics</Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoBold}>NDVI</Text>: Values from -1 to 1. Higher values (0.6-0.9) 
          indicate dense, healthy vegetation.{'\n\n'}
          <Text style={styles.infoBold}>NDBI</Text>: Measures built-up areas. Higher values indicate 
          more urban development.{'\n\n'}
          <Text style={styles.infoBold}>Land Cover</Text>: Percentage of each terrain type in the 
          analyzed region. Vegetation includes forests and agriculture. Changes show how the 
          landscape is transforming over time.
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  indexCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  indexName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  indexInfo: {
    fontSize: 16,
  },
  indexDescription: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 18,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  comparisonItem: {
    flex: 1,
  },
  comparisonYear: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  comparisonArrow: {
    fontSize: 20,
    color: '#cbd5e1',
    marginHorizontal: 12,
  },
  valueBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  valueBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  changeLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  changeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  landCoverCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  landCoverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  landCoverLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  landCoverValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  landCoverYear1: {
    fontSize: 14,
    color: '#94a3b8',
  },
  landCoverArrow: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  landCoverYear2: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  landCoverChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  summaryDescription: {
    fontSize: 13,
    color: '#64748b',
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
  infoBold: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    padding: 20,
  },
});
