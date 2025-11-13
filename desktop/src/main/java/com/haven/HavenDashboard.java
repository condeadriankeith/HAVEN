package com.haven;

import javax.swing.*;
import javax.swing.table.DefaultTableCellRenderer;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;
import java.util.Timer;
import java.util.TimerTask;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Clip;
import javax.sound.sampled.AudioInputStream;
import java.io.File;

public class HavenDashboard extends JFrame {

    private CardLayout centerCardLayout;
    private JPanel centerCardPanel;
    private MapPanel mapPanel;
    private AlertPanel alertPanel;
    private AtomicInteger markerCounter = new AtomicInteger(0);
    private ApiService apiService;
    private Timer dataRefreshTimer;
    private WebSocketClient webSocketClient;

    // User data model
    private List<User> allUsers = new ArrayList<>();
    private List<User> onlineUsers = new ArrayList<>();

    // Add fields to track emergency statistics
    private int totalReports = 0;
    private int activeReports = 0;
    private long totalResponseTime = 0;
    private int resolvedReports = 0;

    public HavenDashboard() {
        setTitle("HAVEN - Pet Emergency Response Dashboard");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(1400, 900);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());
        
        // Initialize API service
        apiService = ApiService.getInstance();
        
        // Initialize user data
        initializeUserData();
        
        initUI();
        
        // Initialize WebSocket without authentication for prototype
        initializeWebSocket();
        
        // Start periodic data refresh
        startDataRefresh();
    }

    private void initializeWebSocket() {
        try {
            // For prototype, connect without authentication as per project requirements
            webSocketClient = new WebSocketClient();
            // Set up listener for emergency updates
            webSocketClient.setEmergencyUpdateListener(this::handleEmergencyUpdate);
            webSocketClient.setConnectionListener(new WebSocketClient.ConnectionListener() {
                @Override
                public void onConnected() {
                    System.out.println("WebSocket connected for real-time updates");
                    SwingUtilities.invokeLater(() -> {
                        // Update UI to show connected status
                    });
                }

                @Override
                public void onDisconnected() {
                    System.out.println("WebSocket disconnected");
                    SwingUtilities.invokeLater(() -> {
                        // Update UI to show disconnected status
                    });
                }

                @Override
                public void onError(String errorMessage) {
                    System.err.println("WebSocket error: " + errorMessage);
                    SwingUtilities.invokeLater(() -> {
                        JOptionPane.showMessageDialog(HavenDashboard.this, 
                            "WebSocket connection error: " + errorMessage, 
                            "Connection Error", 
                            JOptionPane.ERROR_MESSAGE);
                    });
                }
            });
            
            // Connect without authentication token for prototype as per project requirements
            // Add a small delay to ensure the server is ready
            Thread.sleep(1000);
            webSocketClient.connect(null);
            System.out.println("WebSocket connected for real-time updates without authentication (prototype mode)");
        } catch (Exception e) {
            System.err.println("Failed to connect WebSocket: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String loginWithDefaultCredentials() {
        // For prototype, we don't need to authenticate
        // Return null to indicate no authentication is needed
        return null;
    }

    private void handleEmergencyUpdate(JsonObject emergency) {
        SwingUtilities.invokeLater(() -> {
            try {
                System.out.println("Received emergency update: " + emergency.toString());
                
                // Extract emergency data with proper field names from the backend
                String id = emergency.has("emergencyId") ? emergency.get("emergencyId").getAsString() : 
                       (emergency.has("id") ? emergency.get("id").getAsString() : "Unknown");
                String type = emergency.has("emergencyType") ? emergency.get("emergencyType").getAsString() : 
                         (emergency.has("type") ? emergency.get("type").getAsString() : "Pet Emergency");
                String description = emergency.has("notes") ? emergency.get("notes").getAsString() : 
                                (emergency.has("description") ? emergency.get("description").getAsString() : "Pet Emergency Reported");
                String status = emergency.has("status") ? emergency.get("status").getAsString() : "ACTIVE";
            
                // Extract user information
                String userName = emergency.has("userName") ? emergency.get("userName").getAsString() : "User";
                String userPhone = emergency.has("userPhone") ? emergency.get("userPhone").getAsString() : "";
                String userEmail = emergency.has("userEmail") ? emergency.get("userEmail").getAsString() : "";
                String userPets = emergency.has("userPets") ? emergency.get("userPets").getAsString() : "[]";
                
                // Create contact information string
                String contactInfo = "";
                if (!userPhone.isEmpty() && !userEmail.isEmpty()) {
                    contactInfo = userPhone + " / " + userEmail;
                } else if (!userPhone.isEmpty()) {
                    contactInfo = userPhone;
                } else if (!userEmail.isEmpty()) {
                    contactInfo = userEmail;
                }
            
                // Extract latitude and longitude, handling both flat and nested structures
                double lat = 10.6951; // Default to Bacolod center
                double lng = 122.9527; // Default to Bacolod center
            
                System.out.println("Raw emergency data: " + emergency.toString());
            
                // Check for nested structure (from WebSocket direct send)
                if (emergency.has("location")) {
                    JsonObject location = emergency.getAsJsonObject("location");
                    System.out.println("Location object: " + location.toString());
                    if (location.has("latitude") && location.has("longitude")) {
                        lat = location.get("latitude").getAsDouble();
                        lng = location.get("longitude").getAsDouble();
                        System.out.println("Extracted coordinates from nested location: " + lat + ", " + lng);
                    }
                }
                // Check for flat structure (from REST API) as fallback
                else if (emergency.has("latitude") && emergency.has("longitude")) {
                    lat = emergency.get("latitude").getAsDouble();
                    lng = emergency.get("longitude").getAsDouble();
                    System.out.println("Extracted coordinates from flat structure: " + lat + ", " + lng);
                }
                // Check for nested emergency object (from mobile app WebSocket structure)
                else if (emergency.has("emergency")) {
                    JsonObject nestedEmergency = emergency.getAsJsonObject("emergency");
                    if (nestedEmergency.has("location")) {
                        JsonObject location = nestedEmergency.getAsJsonObject("location");
                        if (location.has("latitude") && location.has("longitude")) {
                            lat = location.get("latitude").getAsDouble();
                            lng = location.get("longitude").getAsDouble();
                            System.out.println("Extracted coordinates from nested emergency.location: " + lat + ", " + lng);
                        }
                    } else if (nestedEmergency.has("latitude") && nestedEmergency.has("longitude")) {
                        lat = nestedEmergency.get("latitude").getAsDouble();
                        lng = nestedEmergency.get("longitude").getAsDouble();
                        System.out.println("Extracted coordinates from nested emergency: " + lat + ", " + lng);
                    }
                }
            
                // Validate coordinates are within reasonable bounds for Bacolod City
                if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                    System.err.println("Invalid coordinates detected: " + lat + ", " + lng + ". Using default Bacolod coordinates.");
                    lat = 10.6765;
                    lng = 122.9509;
                }
            
                System.out.println("Final coordinates to be used: " + lat + ", " + lng);
            
                // Additional validation to prevent ocean coordinates
                if (lat == 0 && lng == 0) {
                    System.err.println("Warning: Coordinates are 0,0 (middle of ocean). Using default Bacolod coordinates.");
                    lat = 10.6765;
                    lng = 122.9509;
                }
            
                // Extract location accuracy and other details if available
                String address = emergency.has("address") ? emergency.get("address").getAsString() : 
                            (emergency.has("location") && emergency.getAsJsonObject("location").has("address") ? 
                             emergency.getAsJsonObject("location").get("address").getAsString() : 
                             (emergency.has("emergency") && emergency.getAsJsonObject("emergency").has("location") && 
                              emergency.getAsJsonObject("emergency").getAsJsonObject("location").has("address") ?
                              emergency.getAsJsonObject("emergency").getAsJsonObject("location").get("address").getAsString() :
                              "Location in Bacolod City"));
            
                System.out.println("Processing emergency update: " + id + " - " + type + " - " + status);
                System.out.println("Emergency location: " + lat + ", " + lng);
            
                // Add to alert panel with full location details and pet information
                String alertDescription = description + (emergency.has("location") && emergency.getAsJsonObject("location").has("accuracy") ?
                " (Accuracy: " + emergency.getAsJsonObject("location").get("accuracy").getAsDouble() + "m)" : 
                (emergency.has("accuracy") ? 
                 " (Accuracy: " + emergency.get("accuracy").getAsDouble() + "m)" : ""));
                alertPanel.addAlert(new AlertPanel.AlertData(type, alertDescription, userName, id, lat, lng, userPets, contactInfo));
            
                // Add animated marker to map with proper title
                String markerTitle = type + " (" + id + ")";
                if (emergency.has("location") && emergency.getAsJsonObject("location").has("accuracy")) {
                    markerTitle += " ±" + String.format("%.0f", emergency.getAsJsonObject("location").get("accuracy").getAsDouble()) + "m";
                } else if (emergency.has("accuracy")) {
                    markerTitle += " ±" + String.format("%.0f", emergency.get("accuracy").getAsDouble()) + "m";
                }
                mapPanel.addMarker(lat, lng, markerTitle, true, id); // Highlight the new marker and pass the emergency ID
                mapPanel.centerOn(lat, lng); // Center the map on the new emergency location
            
                // Update analytics dashboard based on status
                updateAnalyticsForEmergency(status, "NEW");
            
                // Show notification
                showDesktopNotification("🚨 New Pet Emergency", 
                    "Emergency reported at coordinates: " + lat + ", " + lng);
            } catch (Exception e) {
                System.err.println("Error processing emergency update: " + e.getMessage());
                System.err.println("Emergency data: " + emergency.toString());
                e.printStackTrace();
            }
        });
    }

    // Method to update analytics dashboard based on emergency status
    private void updateAnalyticsForEmergency(String status, String updateType) {
        // Update statistics based on emergency status
        if ("NEW".equals(updateType)) {
            // New emergency report
            totalReports++;
            if ("ACTIVE".equals(status)) {
                activeReports++;
            }
        } else if ("ACTIVE".equals(status)) {
            // Emergency became active
            activeReports++;
        } else if ("RESOLVED".equals(status)) {
            // Emergency was resolved
            if (activeReports > 0) {
                activeReports--;
                resolvedReports++;
                // For demo purposes, we'll add a fixed response time
                totalResponseTime += 300; // 5 minutes
            }
        }
        
        // Update the stat cards in the analytics panel
        SwingUtilities.invokeLater(() -> {
            updateStatCard("totalReportsCard", "Total Reports", String.valueOf(totalReports));
            updateStatCard("activeReportsCard", "Active Reports", String.valueOf(activeReports));
            
            // Calculate and update average response time if we have resolved reports
            if (resolvedReports > 0) {
                long avgResponseTime = totalResponseTime / resolvedReports;
                String avgResponseText = formatTime(avgResponseTime);
                updateStatCard("avgResponseCard", "Avg. Response", avgResponseText);
            }
        });
    }

    // Overloaded method for backward compatibility
    private void updateAnalyticsForEmergency(String status) {
        updateAnalyticsForEmergency(status, "STATUS_CHANGE");
    }

    // Method to update analytics dashboard with current statistics for new emergencies
    private void updateAnalyticsDashboard() {
        // Increment total reports
        totalReports++;
        
        // Update analytics for active status
        updateAnalyticsForEmergency("ACTIVE", "NEW");
    }
    
    // Helper method to format time in a readable format
    private String formatTime(long seconds) {
        if (seconds < 60) {
            return seconds + "s";
        } else if (seconds < 3600) {
            return (seconds / 60) + "m";
        } else {
            return (seconds / 3600) + "h " + ((seconds % 3600) / 60) + "m";
        }
    }

    private void showDesktopNotification(String title, String message) {
        // Play alert sound
        playAlertSound();
        
        // Show desktop notification
        JOptionPane.showMessageDialog(this, 
            message,
            title, 
            JOptionPane.INFORMATION_MESSAGE);
    }

    private void playAlertSound() {
        try {
            // In a real implementation, you would play an actual sound file
            // For now, we'll just print to console
            System.out.println("[ALERT] Playing emergency alert sound!");
            // Uncomment and implement the following for actual sound playback:
            /*
            File soundFile = new File("src/main/resources/notification.wav");
            AudioInputStream audioIn = AudioSystem.getAudioInputStream(soundFile);
            Clip clip = AudioSystem.getClip();
            clip.open(audioIn);
            clip.start();
            */
        } catch (Exception e) {
            System.err.println("Error playing alert sound: " + e.getMessage());
        }
    }

    private void initializeUserData() {
        // Fetch users from the backend API
        fetchUsersFromBackend();
    }
    
    private void fetchUsersFromBackend() {
        // Run in a separate thread to avoid blocking the UI
        new Thread(() -> {
            try {
                // Fetch users from the real backend API
                JsonObject usersResponse = apiService.getAllUsers();
                
                if (usersResponse != null && usersResponse.has("users")) {
                    JsonArray usersArray = usersResponse.getAsJsonArray("users");
                    
                    // Update UI on EDT
                    SwingUtilities.invokeLater(() -> {
                        // Clear existing users
                        allUsers.clear();
                        
                        // Parse users from response
                        for (int i = 0; i < usersArray.size(); i++) {
                            JsonObject userJson = usersArray.get(i).getAsJsonObject();
                            
                            User user = new User(
                                userJson.has("id") ? userJson.get("id").getAsString() : "",
                                userJson.has("firstName") ? userJson.get("firstName").getAsString() : "",
                                userJson.has("lastName") ? userJson.get("lastName").getAsString() : "",
                                userJson.has("email") ? userJson.get("email").getAsString() : "",
                                userJson.has("phone") ? userJson.get("phone").getAsString() : "",
                                userJson.has("role") ? userJson.get("role").getAsString() : "pet_owner",
                                userJson.has("pets") ? userJson.get("pets").toString() : "[]"
                            );
                            
                            allUsers.add(user);
                        }
                        
                        // Refresh the users panel
                        refreshUsersPanel();
                    });
                }
            } catch (Exception e) {
                System.err.println("Error fetching users from backend: " + e.getMessage());
                e.printStackTrace();
                
                // Fallback to mock data if API call fails
                SwingUtilities.invokeLater(() -> {
                    // Clear existing users
                    allUsers.clear();
                    
                    // Create a mock admin user
                    User adminUser = new User(
                        "USR-000001",
                        "Admin",
                        "User",
                        "admin@haven.com",
                        "+1234567890",
                        "admin",
                        "[]"
                    );
                    
                    allUsers.add(adminUser);
                    
                    // Refresh the users panel
                    refreshUsersPanel();
                });
            }
        }).start();
    }

    private void initUI() {
        // Top bar
        JPanel topBar = createTopBar();
        add(topBar, BorderLayout.NORTH);

        // Left sidebar - redesigned with icons at top
        JPanel leftSidebar = createLeftSidebar();
        add(leftSidebar, BorderLayout.WEST);

        // Right alerts panel - removed the second parameter since the add button is no longer needed
        alertPanel = new AlertPanel(this::onAlertClicked);
        add(alertPanel, BorderLayout.EAST);

        // Center area with CardLayout
        centerCardLayout = new CardLayout();
        centerCardPanel = new JPanel(centerCardLayout);

        // Map page
        mapPanel = new MapPanel();
        centerCardPanel.add(createMapPanel(), "MAP");

        // Analytics page (simple placeholder)
        centerCardPanel.add(createAnalyticsPanel(), "ANALYTICS");

        // Users page
        centerCardPanel.add(createUsersPanel(), "USERS");

        add(centerCardPanel, BorderLayout.CENTER);

        // Start at Map
        centerCardLayout.show(centerCardPanel, "MAP");
        
        // Start the clock update timer
        startClockUpdate();
        
        // Don't fetch initial data to avoid showing alerts on startup
    }

    private void startDataRefresh() {
        // Remove periodic data refresh since we're using real-time WebSocket updates
        // dataRefreshTimer = new Timer();
        // dataRefreshTimer.scheduleAtFixedRate(new TimerTask() {
        //     @Override
        //     public void run() {
        //         // Removed simulation of random alerts
        //         // fetchNewAlerts() was creating fake alerts
        //         // Real alerts are now received via WebSocket only
        //     }
        // }, 5000, 10000); // Refresh every 10 seconds
    }

    private void fetchNewAlerts() {
        // This method was simulating random alerts, which caused the issue
        // Real alerts are now received via WebSocket in handleEmergencyUpdate()
        // Keeping this method for potential future use but removing the simulation
    }

    private JPanel createTopBar() {
        JPanel top = new RoundedPanel();
        top.setBackground(Color.WHITE); // Light theme background
        top.setPreferredSize(new Dimension(10, 64));
        top.setLayout(new BorderLayout(10, 10));
        top.setBorder(BorderFactory.createEmptyBorder(10, 16, 10, 16));

        JLabel title = new JLabel("HAVEN — Emergency Response");
        title.setFont(title.getFont().deriveFont(Font.BOLD, 18f));
        title.setForeground(new Color(255, 59, 48)); // HAVEN Red
        top.add(title, BorderLayout.WEST);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 8));
        right.setOpaque(false);

        JLabel dt = new JLabel("Region: Bacolod City  |  " + java.time.LocalDateTime.now().toString().replace('T', ' '));
        dt.setForeground(Color.DARK_GRAY); // Darker text for light theme
        right.add(dt);

        top.add(right, BorderLayout.EAST);
        return top;
    }

    private JPanel createLeftSidebar() {
        JPanel left = new JPanel();
        left.setLayout(new BorderLayout());
        left.setBackground(Color.WHITE); // Light theme background
        left.setPreferredSize(new Dimension(80, 0));
        left.setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));

        // Top panel for icons
        JPanel iconPanel = new JPanel();
        iconPanel.setLayout(new BoxLayout(iconPanel, BoxLayout.Y_AXIS));
        iconPanel.setBackground(Color.WHITE); // Light theme background
        iconPanel.setBorder(BorderFactory.createEmptyBorder(10, 0, 10, 0));

        // Map icon button
        CustomButton btnMap = new CustomButton("\uD83D\uDDFA"); // 🗺️
        btnMap.setPreferredSize(new Dimension(50, 50));
        btnMap.setMaximumSize(new Dimension(50, 50));
        btnMap.setFont(btnMap.getFont().deriveFont(20f));
        btnMap.addActionListener(e -> centerCardLayout.show(centerCardPanel, "MAP"));
        iconPanel.add(btnMap);
        iconPanel.add(Box.createVerticalStrut(15));

        // Analytics icon button
        CustomButton btnAnalytics = new CustomButton("\uD83D\uDCCA"); // 📊
        btnAnalytics.setPreferredSize(new Dimension(50, 50));
        btnAnalytics.setMaximumSize(new Dimension(50, 50));
        btnAnalytics.setFont(btnAnalytics.getFont().deriveFont(20f));
        btnAnalytics.addActionListener(e -> centerCardLayout.show(centerCardPanel, "ANALYTICS"));
        iconPanel.add(btnAnalytics);
        iconPanel.add(Box.createVerticalStrut(15));

        // Users icon button
        CustomButton btnUsers = new CustomButton("\uD83D\uDC64"); // 👤
        btnUsers.setPreferredSize(new Dimension(50, 50));
        btnUsers.setMaximumSize(new Dimension(50, 50));
        btnUsers.setFont(btnUsers.getFont().deriveFont(20f));
        btnUsers.addActionListener(e -> centerCardLayout.show(centerCardPanel, "USERS"));
        iconPanel.add(btnUsers);

        // Bottom panel for spacer
        JPanel bottomPanel = new JPanel();
        bottomPanel.setBackground(Color.WHITE); // Light theme background
        bottomPanel.setLayout(new BorderLayout());

        left.add(iconPanel, BorderLayout.NORTH);
        left.add(bottomPanel, BorderLayout.CENTER);

        return left;
    }

    private JPanel createAnalyticsPanel() {
        JPanel p = new RoundedPanel();
        p.setBackground(Color.WHITE); // Light theme background
        p.setLayout(new BorderLayout(10, 10));
        p.setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));
        JLabel lbl = new JLabel("Analytics Dashboard");
        lbl.setFont(lbl.getFont().deriveFont(Font.BOLD, 20f));
        lbl.setForeground(Color.BLACK);
        p.add(lbl, BorderLayout.NORTH);

        // Create a panel to hold the cards with zero/empty values until actual data is available
        JPanel cardsPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 12, 12));
        cardsPanel.setOpaque(false);
        cardsPanel.add(createStatCard("Total Reports", "0", "totalReportsCard"));
        cardsPanel.add(createStatCard("Active Reports", "0", "activeReportsCard"));
        cardsPanel.add(createStatCard("Avg. Response", "--", "avgResponseCard"));
        
        p.add(cardsPanel, BorderLayout.CENTER);
        
        // Remove the refresh button and initial data fetch
        
        return p;
    }
    
    private JPanel createMapPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));
        
        // Add map panel directly
        panel.add(mapPanel, BorderLayout.CENTER);
        
        return panel;
    }
    
    // Store references to stat cards for updating
    private Map<String, JPanel> statCardMap = new HashMap<>();
    
    private JPanel createStatCard(String title, String value, String cardId) {
        RoundedPanel card = new RoundedPanel();
        card.setPreferredSize(new Dimension(200, 80)); // Shortened height from 120 to 80
        card.setLayout(new BorderLayout());
        card.setBorder(BorderFactory.createEmptyBorder(5, 12, 5, 12)); // Reduced vertical padding
        card.setBackground(new Color(245, 245, 245)); // Light card background
        
        // Store reference to card for updating
        statCardMap.put(cardId, card);
        
        // Create a panel to center the title
        JPanel titlePanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 0, 0));
        titlePanel.setOpaque(false);
        JLabel t = new JLabel(title); 
        t.setForeground(Color.DARK_GRAY);
        titlePanel.add(t);
        
        // Create a panel to center the value
        JPanel valuePanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 0, 0));
        valuePanel.setOpaque(false);
        JLabel v = new JLabel(value); 
        v.setFont(v.getFont().deriveFont(Font.BOLD, 22f)); 
        v.setForeground(new Color(255, 59, 48)); // HAVEN Red
        v.setName("valueLabel"); // Set name for updating
        valuePanel.add(v);
        
        card.add(titlePanel, BorderLayout.NORTH);
        card.add(valuePanel, BorderLayout.CENTER);
        return card;
    }
    
    private void updateStatCard(String cardId, String title, String newValue) {
        JPanel card = statCardMap.get(cardId);
        if (card != null) {
            // Find the value label and update it
            Component[] components = card.getComponents();
            for (Component component : components) {
                if (component instanceof JPanel) {
                    JPanel panel = (JPanel) component;
                    Component[] panelComponents = panel.getComponents();
                    for (Component panelComponent : panelComponents) {
                        if (panelComponent instanceof JLabel && "valueLabel".equals(panelComponent.getName())) {
                            JLabel valueLabel = (JLabel) panelComponent;
                            valueLabel.setText(newValue);
                            break;
                        }
                    }
                }
            }
        }
    }

    private JPanel createStatCard(String title, String value) {
        RoundedPanel card = new RoundedPanel();
        card.setPreferredSize(new Dimension(200, 80)); // Shortened height from 120 to 80
        card.setLayout(new BorderLayout());
        card.setBorder(BorderFactory.createEmptyBorder(5, 12, 5, 12)); // Reduced vertical padding
        card.setBackground(new Color(245, 245, 245)); // Light card background
        
        // Create a panel to center the title
        JPanel titlePanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 0, 0));
        titlePanel.setOpaque(false);
        JLabel t = new JLabel(title); 
        t.setForeground(Color.DARK_GRAY);
        titlePanel.add(t);
        
        // Create a panel to center the value
        JPanel valuePanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 0, 0));
        valuePanel.setOpaque(false);
        JLabel v = new JLabel(value); 
        v.setFont(v.getFont().deriveFont(Font.BOLD, 22f)); 
        v.setForeground(new Color(255, 59, 48)); // HAVEN Red
        valuePanel.add(v);
        
        card.add(titlePanel, BorderLayout.NORTH);
        card.add(valuePanel, BorderLayout.CENTER);
        return card;
    }

    // Users Panel implementation
    private JPanel createUsersPanel() {
        JPanel panel = new RoundedPanel();
        panel.setBackground(Color.WHITE); // Light theme background
        panel.setLayout(new BorderLayout(10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));
        
        JLabel title = new JLabel("Users");
        title.setFont(title.getFont().deriveFont(Font.BOLD, 20f));
        title.setForeground(Color.BLACK);
        panel.add(title, BorderLayout.NORTH);
        
        // Create tabs for different user views
        JTabbedPane tabbedPane = new JTabbedPane();
        
        // All Users tab
        JPanel allUsersPanel = createUsersTablePanel(allUsers, "All Registered Users");
        tabbedPane.addTab("All Users", allUsersPanel);
        
        // Online Users tab
        JPanel onlineUsersPanel = createUsersTablePanel(onlineUsers, "Currently Online Users");
        tabbedPane.addTab("Online Users", onlineUsersPanel);
        
        panel.add(tabbedPane, BorderLayout.CENTER);
        
        return panel;
    }

    private void onAlertClicked(AlertPanel.AlertData data) {
        // Center map on the alert location without adding a new marker
        mapPanel.centerOn(data.lat, data.lng);
        // Highlight existing marker if it exists
        mapPanel.highlightMarker(data.lat, data.lng);
    }

    private void simulateAddAlert() {
        // This method was creating fake alerts
        // Commenting out to prevent random alerts from appearing
        /*
        double lat = 10.6765 + Math.random() * 0.02 - 0.01;
        double lng = 122.9509 + Math.random() * 0.02 - 0.01;
        String id = "ALRT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String title = "Pet Emergency " + markerCounter.incrementAndGet();
        alertPanel.addAlert(new AlertPanel.AlertData(title, "Location sample", "Owner", id, lat, lng));
        mapPanel.addMarker(lat, lng, title, false);
        */
    }
    
    // Simple User data class
    private static class User {
        public final String id;
        public final String firstName;
        public final String lastName;
        public final String email;
        public final String phone;
        public final String role;
        public final String pets; // Store pets as JSON string
        
        public User(String id, String firstName, String lastName, String email, String phone, String role, String pets) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.phone = phone;
            this.role = role;
            this.pets = pets != null ? pets : "[]";
        }
    }
    
    // Helper method to create user table panels
    private JPanel createUsersTablePanel(List<User> users, String title) {
        JPanel panel = new JPanel(new BorderLayout());
        
        // Title
        JLabel titleLabel = new JLabel(title + " (" + users.size() + " users)");
        titleLabel.setFont(titleLabel.getFont().deriveFont(Font.BOLD, 16f));
        titleLabel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        panel.add(titleLabel, BorderLayout.NORTH);
        
        // Create a table to display users
        String[] columnNames = {"ID", "First Name", "Last Name", "Email", "Phone", "Role", "Pets"};
        
        // Convert user data to table format
        Object[][] data = new Object[users.size()][7];
        for (int i = 0; i < users.size(); i++) {
            User user = users.get(i);
            data[i][0] = user.id;
            data[i][1] = user.firstName;
            data[i][2] = user.lastName;
            data[i][3] = user.email;
            data[i][4] = user.phone;
            data[i][5] = user.role;
            data[i][6] = formatPetsForDisplay(user.pets);
        }
        
        JTable table = new JTable(data, columnNames) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false; // Make table non-editable
            }
        };
        
        // Style the table
        table.setBackground(Color.WHITE);
        table.setForeground(Color.BLACK);
        table.setGridColor(new Color(200, 200, 200));
        table.setSelectionBackground(new Color(255, 59, 48)); // HAVEN Red selection
        table.setSelectionForeground(Color.WHITE);
        table.getTableHeader().setBackground(new Color(240, 240, 240));
        table.getTableHeader().setForeground(Color.BLACK);
        table.getTableHeader().setFont(table.getFont().deriveFont(Font.BOLD));
        
        // Center content in cells both horizontally and vertically
        DefaultTableCellRenderer centerRenderer = new DefaultTableCellRenderer();
        centerRenderer.setHorizontalAlignment(JLabel.CENTER);
        centerRenderer.setVerticalAlignment(JLabel.CENTER);
        for (int i = 0; i < table.getColumnCount(); i++) {
            table.getColumnModel().getColumn(i).setCellRenderer(centerRenderer);
        }
        
        // Set row height and other properties for proper spacing
        table.setRowHeight(35);
        table.setIntercellSpacing(new Dimension(10, 10));
        table.setShowGrid(true);
        table.setGridColor(new Color(200, 200, 200));
        
        // Add padding to table cells
        ((DefaultTableCellRenderer)table.getDefaultRenderer(Object.class)).setBorder(
            BorderFactory.createEmptyBorder(5, 10, 5, 10));
        
        JScrollPane scrollPane = new JScrollPane(table);
        scrollPane.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        scrollPane.getViewport().setBackground(Color.WHITE);
        panel.add(scrollPane, BorderLayout.CENTER);
        
        return panel;
    }
    
    // Helper method to format pets for display in the table
    private String formatPetsForDisplay(String petsJson) {
        try {
            if (petsJson == null || petsJson.equals("[]") || petsJson.isEmpty()) {
                return "No pets";
            }
            
            com.google.gson.JsonArray petsArray = com.google.gson.JsonParser.parseString(petsJson).getAsJsonArray();
            if (petsArray.size() == 0) {
                return "No pets";
            }
            
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < petsArray.size(); i++) {
                if (i > 0) result.append(", ");
                
                com.google.gson.JsonObject pet = petsArray.get(i).getAsJsonObject();
                String name = pet.has("name") ? pet.get("name").getAsString() : "Unknown";
                String type = pet.has("type") ? pet.get("type").getAsString() : "Pet";
                String breed = pet.has("breed") ? pet.get("breed").getAsString() : "";
                
                result.append(name);
                if (!breed.isEmpty()) {
                    result.append(" (").append(breed).append(" ").append(type).append(")");
                } else {
                    result.append(" (").append(type).append(")");
                }
            }
            
            return result.toString();
        } catch (Exception e) {
            System.err.println("Error parsing pets JSON for display: " + e.getMessage());
            return "Error parsing pets";
        }
    }
    
    @Override
    public void dispose() {
        // Clean up the timer and WebSocket when the window is closed
        if (dataRefreshTimer != null) {
            dataRefreshTimer.cancel();
        }
        if (webSocketClient != null) {
            webSocketClient.disconnect();
        }
        super.dispose();
    }
    
    private void startClockUpdate() {
        Timer clockTimer = new Timer();
        clockTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                SwingUtilities.invokeLater(() -> {
                    // Find the date/time label in the top bar and update it
                    Component[] components = ((JPanel) getContentPane().getComponent(0)).getComponents();
                    for (Component component : components) {
                        if (component instanceof JPanel) {
                            Component[] rightComponents = ((JPanel) component).getComponents();
                            for (Component rightComponent : rightComponents) {
                                if (rightComponent instanceof JLabel) {
                                    JLabel label = (JLabel) rightComponent;
                                    String text = label.getText();
                                    if (text != null && text.contains("Region: Bacolod City")) {
                                        String dateTime = java.time.LocalDateTime.now().toString().replace('T', ' ').substring(0, 19);
                                        label.setText("Region: Bacolod City  |  " + dateTime);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }, 0, 1000); // Update every second
    }
    
    private void refreshUsersPanel() {
        // This is a placeholder method for refreshing the users panel
        // In a real implementation, you would properly refresh the users panel
        System.out.println("Users panel refreshed with " + allUsers.size() + " users");
    }
}