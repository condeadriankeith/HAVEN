import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/styles';

const NotificationsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emergencyUpdates, setEmergencyUpdates] = useState(true);
  const [safetyReminders, setSafetyReminders] = useState(true);
  const [localAlerts, setLocalAlerts] = useState(true);

  const notificationSettings = [
    {
      id: 'emergency',
      title: 'Emergency Updates',
      description: 'Receive updates on your emergency reports',
      enabled: emergencyUpdates,
      setter: setEmergencyUpdates
    },
    {
      id: 'reminders',
      title: 'Safety Reminders',
      description: 'Get periodic pet safety tips and reminders',
      enabled: safetyReminders,
      setter: setSafetyReminders
    },
    {
      id: 'local',
      title: 'Local Alerts',
      description: 'Nearby pet emergencies and community alerts',
      enabled: localAlerts,
      setter: setLocalAlerts
    }
  ];

  const sampleNotifications = [
    {
      id: '1',
      title: 'Responder Dispatched',
      message: 'A responder has been dispatched to your location for the injured dog report.',
      timestamp: '2025-10-28T14:35:00Z',
      read: false
    },
    {
      id: '2',
      title: 'Case Resolved',
      message: 'Your emergency report from Oct 25 has been marked as resolved.',
      timestamp: '2025-10-26T10:15:00Z',
      read: true
    },
    {
      id: '3',
      title: 'Safety Reminder',
      message: 'Remember to keep your pet\'s ID tags updated for emergencies.',
      timestamp: '2025-10-27T09:00:00Z',
      read: true
    }
  ];

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      Alert.alert('Notifications Enabled', 'You will now receive emergency alerts and updates.');
    } else {
      Alert.alert('Notifications Disabled', 'You will no longer receive emergency alerts.');
    }
  };

  const renderNotificationItem = ({ item }) => (
    <View style={[styles.notificationItem, !item.read && styles.unreadNotification]}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
    </View>
  );

  const renderSettingItem = ({ item }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      <Switch
        trackColor={{ false: COLORS.accentGray, true: COLORS.accentRed }}
        thumbColor={item.enabled ? COLORS.primaryBackground : COLORS.secondaryBackground}
        onValueChange={item.setter}
        value={item.enabled}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      
      <View style={styles.notificationsToggle}>
        <Text style={styles.toggleLabel}>Enable Notifications</Text>
        <Switch
          trackColor={{ false: COLORS.accentGray, true: COLORS.accentRed }}
          thumbColor={notificationsEnabled ? COLORS.primaryBackground : COLORS.secondaryBackground}
          onValueChange={toggleNotifications}
          value={notificationsEnabled}
        />
      </View>
      
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      <FlatList
        data={notificationSettings}
        renderItem={renderSettingItem}
        keyExtractor={item => item.id}
        style={styles.settingsList}
      />
      
      <Text style={styles.sectionTitle}>Recent Notifications</Text>
      <FlatList
        data={sampleNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsListContent}
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
    marginBottom: SPACING.large,
  },
  notificationsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
    padding: SPACING.medium,
    borderRadius: 8,
    marginBottom: SPACING.large,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.medium,
    marginTop: SPACING.medium,
  },
  settingsList: {
    marginBottom: SPACING.large,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
    padding: SPACING.medium,
    borderRadius: 8,
    marginBottom: SPACING.small,
  },
  settingText: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    color: COLORS.textSecondary,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsListContent: {
    paddingBottom: SPACING.large,
  },
  notificationItem: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 8,
    padding: SPACING.medium,
    marginBottom: SPACING.small,
    // Removed border styles as per UI guidelines - using spacing and background colors instead
  },
  unreadNotification: {
    // Replaced border with background color variation for visual distinction
    backgroundColor: '#F0F0F0', // Slightly different background for unread notifications
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    color: COLORS.textSecondary,
  },
});

export default NotificationsScreen;