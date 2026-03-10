import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AnalysisResponse } from '../types';

interface PredictionScreenProps {
  route: {
    params: {
      data: AnalysisResponse;
    };
  };
  navigation: any;
}

export default function PredictionScreen({ route, navigation }: PredictionScreenProps) {
  const { data } = route.params;

  // Enhanced safety checks
  if (!data || !data.prediction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No prediction data available. Run analysis first to generate predictions.
        </Text>
      </View>
    );
  }

  const { prediction } = data;

  const getRiskColor = (score: number) => {
    if (score >= 7) return '#dc2626';
    if (score >= 5) return '#f59e0b';
    if (score >= 3) return '#facc15';
    return '#22c55e';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 7) return 'Critical';
    if (score >= 5) return 'High';
    if (score >= 3) return 'Moderate';
    return 'Low';
  };

  return (
    <ScrollView style={styles.container}>
      {/* AI Prediction Header */}
      <View style={styles.aiHeader}>
        <Text style={styles.aiIcon}>🤖</Text>
        <View style={styles.aiHeaderText}>
          <Text style={styles.aiTitle}>AI-Powered Predictions</Text>
          <Text style={styles.aiSubtitle}>Forecasting environmental changes for 2027</Text>
        </View>
      </View>

      {/* Confidence Score */}
      <View style={styles.confidenceCard}>
        <Text style={styles.confidenceLabel}>Model Confidence</Text>
        <View style={styles.confidenceBar}>
          <View 
            style={[
              styles.confidenceFill,
              { width: `${(prediction?.confidence ?? 0) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.confidenceValue}>{((prediction?.confidence ?? 0) * 100).toFixed(0)}%</Text>
        <Text style={styles.confidenceText}>
          Based on historical data from 2000-2026 and current trends
        </Text>
      </View>

      {/* Prediction Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2027 Predictions</Text>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricIcon}>🌲</Text>
            <Text style={styles.metricTitle}>Vegetation Loss</Text>
          </View>
          <Text style={styles.metricValue}>
            {(prediction?.nextYearVegetationLoss ?? 0).toFixed(2)}%
          </Text>
          <Text style={styles.metricDescription}>
            Predicted forest cover reduction compared to 2026
          </Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendIcon}>📈</Text>
            <Text style={styles.trendText}>
              {(prediction?.nextYearVegetationLoss ?? 0) > (data.deforestation?.areaLost ?? 0) 
                ? 'Increasing trend' 
                : 'Decreasing trend'}
            </Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricIcon}>🏗️</Text>
            <Text style={styles.metricTitle}>Urban Growth</Text>
          </View>
          <Text style={styles.metricValue}>
            {(prediction?.nextYearUrbanGrowth ?? 0).toFixed(2)}%
          </Text>
          <Text style={styles.metricDescription}>
            Expected urban expansion across Tamil Nadu
          </Text>
          <View style={styles.trendBadge}>
            <Text style={styles.trendIcon}>📊</Text>
            <Text style={styles.trendText}>
              {(prediction?.nextYearUrbanGrowth ?? 0) > (data.urbanExpansion?.urbanGrowthRate ?? 0) 
                ? 'Accelerating growth' 
                : 'Slowing growth'}
            </Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricIcon}>⚠️</Text>
            <Text style={styles.metricTitle}>Risk Score</Text>
          </View>
          <Text style={[
            styles.metricValue,
            { color: getRiskColor(prediction?.predictedRiskScore ?? 0) }
          ]}>
            {(prediction?.predictedRiskScore ?? 0).toFixed(1)} / 10
          </Text>
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: getRiskColor(prediction?.predictedRiskScore ?? 0) },
            ]}
          >
            <Text style={styles.riskText}>
              {getRiskLabel(prediction?.predictedRiskScore ?? 0)} Risk
            </Text>
          </View>
          <View style={styles.riskBar}>
            <View
              style={[
                styles.riskFill,
                {
                  width: `${((prediction?.predictedRiskScore ?? 0) / 10) * 100}%`,
                  backgroundColor: getRiskColor(prediction?.predictedRiskScore ?? 0),
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* AI Recommendation */}
      <View style={styles.recommendationCard}>
        <View style={styles.recommendationHeader}>
          <Text style={styles.recommendationIcon}>💡</Text>
          <Text style={styles.recommendationTitle}>AI Recommendation</Text>
        </View>
        <Text style={styles.recommendationText}>{prediction?.recommendation ?? 'No recommendation available'}</Text>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How AI Predictions Work</Text>

        <View style={styles.methodCard}>
          <View style={styles.methodStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Historical Analysis</Text>
              <Text style={styles.stepText}>
                AI analyzes 26 years of satellite data (2000-2026) to identify patterns
              </Text>
            </View>
          </View>

          <View style={styles.methodStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Trend Detection</Text>
              <Text style={styles.stepText}>
                Machine learning models detect seasonal patterns and growth trends
              </Text>
            </View>
          </View>

          <View style={styles.methodStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Future Forecasting</Text>
              <Text style={styles.stepText}>
                Predictions extrapolate trends to forecast next year's changes
              </Text>
            </View>
          </View>

          <View style={styles.methodStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Risk Assessment</Text>
              <Text style={styles.stepText}>
                Environmental risk scores help prioritize conservation efforts
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📊 Data-Driven Insights</Text>
        <Text style={styles.infoText}>
          These predictions use machine learning algorithms trained on decades of satellite 
          imagery to forecast environmental changes. While AI provides valuable insights, 
          predictions should be combined with on-ground verification and expert analysis 
          for decision-making.
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
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    padding: 20,
    gap: 12,
  },
  aiIcon: {
    fontSize: 40,
  },
  aiHeaderText: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  confidenceCard: {
    margin: 16,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 6,
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#94a3b8',
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
  metricCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  metricDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  trendIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  riskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  riskText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  riskBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  riskFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  recommendationText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  methodCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
  },
});
