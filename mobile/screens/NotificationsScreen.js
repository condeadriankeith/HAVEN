import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert, ScrollView } from 'react-native';
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

  const [notifications, setNotifications] = useState([]);
    
  // Format timestamp to show "Just now" or elapsed time
  const formatNotificationTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
      
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

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
      <Text style={styles.timestamp}>{formatNotificationTimestamp(item.timestamp)}</Text>
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
    <ScrollView style={styles.container}>
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
      <View style={styles.settingsList}>
        {notificationSettings.map((item) => (
          <View key={item.id} style={styles.settingItem}>
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
        ))}
      </View>
      
      <Text style={styles.sectionTitle}>Recent Notifications</Text>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <View style={styles.notificationsList}>
          {notifications.map((item, index) => (
            <View key={index} style={[styles.notificationItem, !item.read && styles.unreadNotification]}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.timestamp}>{formatNotificationTimestamp(item.timestamp)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBackground,
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.title.fontSize,
    fontWeight: TYPOGRAPHY.title.fontWeight,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  notificationsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.subtitle.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  settingsList: {
    marginBottom: SPACING.xl,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBackground,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  settingText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    color: COLORS.textSecondary,
  },
  notificationsList: {
    marginBottom: SPACING.xl,
  },
  notificationItem: {
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accentGray,
  },
  unreadNotification: {
    backgroundColor: '#F0F0F0',
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.secondary.fontSize,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.secondaryBackground,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textSecondary,
  },
});

export default NotificationsScreen;