import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';
import { emergenciesAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmergencyReports();
  }, []);

  const loadEmergencyReports = async () => {
    try {
      setLoading(true);
      const response = await emergenciesAPI.getActiveEmergencies();
      const userReports = response.data.emergencies || [];
      setReports(userReports);
      setError(null);
    } catch (error) {
      console.error('Error loading emergency reports:', error);
      setError('Failed to load emergency reports. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return COLORS.success;
      case 'in progress':
        return '#FFA000';
      default:
        return COLORS.accentGray;
    }
  };

  const renderReportItem = ({ item }) => (
    <View style={styles.reportItem}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportType}>{item.type || item.emergencyType}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.reportDescription}>{item.description || item.notes}</Text>
      {item.emergencyFee > 0 && (
        <Text style={styles.emergencyFee}>Emergency Fee: ₱{item.emergencyFee}</Text>
      )}
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp || item.reportedAt)}</Text>
      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadEmergencyReports}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Reports</Text>
      <Text style={styles.subtitle}>Your past emergency submissions</Text>
      
      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No emergency reports yet</Text>
          <Text style={styles.emptySubtext}>Your emergency reports will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.emergencyId || item.id}
          renderItem={renderReportItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    padding: SPACING.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  list: {
    paddingBottom: SPACING.xl,
  },
  reportItem: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  reportType: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  status: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    fontWeight: 'bold',
  },
  reportDescription: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emergencyFee: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
    color: '#4CAF50', // Green color for fee
    marginBottom: SPACING.sm,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  detailsButton: {
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.accentRed,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: COLORS.primaryBackground,
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.accentRed,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.primaryBackground,
    fontWeight: '600',
    fontSize: TYPOGRAPHY.button.fontSize,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default HistoryScreen;