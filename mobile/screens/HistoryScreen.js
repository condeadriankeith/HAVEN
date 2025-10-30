import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';

const HistoryScreen = () => {
  const [reports, setReports] = useState([
    // Sample data - in a real app this would come from the API
    {
      id: '1',
      type: 'Injured Pet',
      timestamp: '2025-10-28T14:30:00Z',
      status: 'Resolved',
      description: 'Found injured dog near Central Park'
    },
    {
      id: '2',
      type: 'Stray in Danger',
      timestamp: '2025-10-25T09:15:00Z',
      status: 'In Progress',
      description: 'Stray cat stuck in tree'
    },
    {
      id: '3',
      type: 'Lost Pet',
      timestamp: '2025-10-20T16:45:00Z',
      status: 'Resolved',
      description: 'Lost golden retriever'
    }
  ]);

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
        <Text style={styles.reportType}>{item.type}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.reportDescription}>{item.description}</Text>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Reports</Text>
      <Text style={styles.subtitle}>Your past emergency submissions</Text>
      
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    padding: SPACING.medium,
  },
  title: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SPACING.large,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.large,
  },
  reportItem: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 8,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
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
    marginBottom: SPACING.small,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  detailsButton: {
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    color: COLORS.accentRed,
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;