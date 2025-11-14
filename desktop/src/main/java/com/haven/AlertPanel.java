package com.haven;

import javax.swing.*;
import java.awt.*;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class AlertPanel extends JPanel {
    private final JPanel alertListPanel;
    private final List<AlertData> alerts = new ArrayList<>();
    private final Consumer<AlertData> alertClickListener;
    private final Runnable alertDeselectListener; // Listener for alert deselection
    private AlertData selectedAlert = null; // Track the currently selected alert
    private JPanel selectedCard = null; // Track the currently selected card UI
    // Keep track of expanded state for each alert card
    private final List<Boolean> expandedStates = new ArrayList<>();
    
    // Add a listener for alert removal
    private Consumer<AlertData> alertRemoveListener;
    
    // Constructor for backward compatibility
    public AlertPanel(Consumer<AlertData> alertClickListener) {
        this(alertClickListener, () -> {}); // Default no-op deselect listener
    }
    
    // Updated constructor to support alert removal
    public AlertPanel(Consumer<AlertData> alertClickListener, Runnable alertDeselectListener) {
        this(alertClickListener, alertDeselectListener, null);
    }
    
    // New constructor with alert remove listener
    public AlertPanel(Consumer<AlertData> alertClickListener, Runnable alertDeselectListener, Consumer<AlertData> alertRemoveListener) {
        this.alertClickListener = alertClickListener;
        this.alertDeselectListener = alertDeselectListener;
        this.alertRemoveListener = alertRemoveListener;
        
        setPreferredSize(new Dimension(320, 0)); // Slightly wider
        setBackground(Color.WHITE); // Light theme background
        setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        setLayout(new BorderLayout());
        
        // Header
        JPanel header = new RoundedPanel();
        header.setPreferredSize(new Dimension(0, 60)); // Taller header
        header.setLayout(new BorderLayout());
        header.setBorder(BorderFactory.createEmptyBorder(10, 15, 10, 15));
        header.setBackground(new Color(240, 240, 240)); // Light header background
        
        JLabel title = new JLabel("Recent Alerts");
        title.setFont(title.getFont().deriveFont(Font.BOLD, 18f)); // Larger font
        title.setForeground(new Color(255, 59, 48)); // HAVEN Red
        header.add(title, BorderLayout.WEST);
        
        add(header, BorderLayout.NORTH);
        
        // Scrollable alert list
        alertListPanel = new JPanel();
        alertListPanel.setLayout(new BoxLayout(alertListPanel, BoxLayout.Y_AXIS));
        alertListPanel.setBackground(Color.WHITE); // Light theme background
        
        JScrollPane scrollPane = new JScrollPane(alertListPanel);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
        scrollPane.setBorder(BorderFactory.createEmptyBorder());
        scrollPane.getViewport().setBackground(Color.WHITE); // Match background
        
        // Customize scrollbar
        scrollPane.getVerticalScrollBar().setUnitIncrement(16);
        
        add(scrollPane, BorderLayout.CENTER);
    }
    
    public void addAlert(AlertData alert) {
        alerts.add(0, alert); // Add to the beginning of the list
        expandedStates.add(0, false); // Add corresponding expanded state (default: collapsed)
        
        // Create alert card
        JPanel card = createAlertCard(alert, 0);
        
        // Add to the top of the list
        alertListPanel.add(card, 0);
        alertListPanel.revalidate();
        alertListPanel.repaint();
    }
    
    public void clearAllAlerts() {
        alerts.clear();
        expandedStates.clear();
        alertListPanel.removeAll();
        alertListPanel.revalidate();
        alertListPanel.repaint();
    }
    
    private JPanel createAlertCard(AlertData alert, int index) {
        // Create alert card
        JPanel card = new RoundedPanel();
        card.setPreferredSize(new Dimension(0, getCardHeight(index)));
        card.setMaximumSize(new Dimension(Integer.MAX_VALUE, getCardHeight(index)));
        card.setLayout(new BorderLayout(10, 10));
        card.setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));
        card.setBackground(new Color(245, 245, 245)); // Light card background
        
        // Left side - Title and description
        JPanel left = new JPanel();
        left.setLayout(new BoxLayout(left, BoxLayout.Y_AXIS));
        left.setOpaque(false);
        
        JLabel titleLabel = new JLabel(alert.getTitle());
        titleLabel.setFont(titleLabel.getFont().deriveFont(Font.BOLD, 15f)); // Larger title
        titleLabel.setForeground(Color.BLACK);
        
        JLabel descLabel = new JLabel("<html><p>" + getDisplayDescription(alert, index) + "</p></html>");
        descLabel.setFont(descLabel.getFont().deriveFont(13f));
        descLabel.setForeground(Color.DARK_GRAY);
        descLabel.setVerticalAlignment(SwingConstants.TOP);
        
        JLabel ownerLabel = new JLabel("Reported by: " + alert.getOwner());
        ownerLabel.setFont(ownerLabel.getFont().deriveFont(12f));
        ownerLabel.setForeground(Color.GRAY);
        
        // Add contact information if available
        JLabel contactLabel = new JLabel();
        if (alert.getContactInfo() != null && !alert.getContactInfo().isEmpty()) {
            contactLabel.setText("Contact: " + alert.getContactInfo());
            contactLabel.setFont(contactLabel.getFont().deriveFont(12f));
            contactLabel.setForeground(Color.GRAY);
        }
        
        // Add pet information if available
        JLabel petsLabel = new JLabel();
        System.out.println("Debug: alert.pets = " + alert.getPets()); // Debug line
        if (alert.getPets() != null && !alert.getPets().equals("[]") && !alert.getPets().isEmpty()) {
            String petsText = formatPetsForAlert(alert.getPets());
            System.out.println("Debug: petsText = " + petsText); // Debug line
            if (!petsText.isEmpty()) {
                petsLabel.setText("Pets: " + petsText);
                petsLabel.setFont(petsLabel.getFont().deriveFont(12f));
                petsLabel.setForeground(Color.GRAY);
            }
        }
        
        // Add ID and status information
        JLabel idLabel = new JLabel("ID: " + alert.getId());
        idLabel.setFont(idLabel.getFont().deriveFont(12f));
        idLabel.setForeground(new Color(255, 59, 48)); // HAVEN Red
        
        JLabel coordinatesLabel = new JLabel("Location: " + String.format("%.4f, %.4f", alert.getLat(), alert.getLng()));
        coordinatesLabel.setFont(coordinatesLabel.getFont().deriveFont(12f));
        coordinatesLabel.setForeground(Color.GRAY);
        
        // Add emergency fee information if available
        JLabel feeLabel = new JLabel();
        if (alert.getEmergencyFee() > 0) {
            feeLabel.setText("Emergency Fee: ₱" + alert.getEmergencyFee());
            feeLabel.setFont(feeLabel.getFont().deriveFont(Font.BOLD, 12f));
            feeLabel.setForeground(new Color(46, 204, 113)); // Green color for fee
        }
        
        left.add(titleLabel);
        left.add(Box.createVerticalStrut(5));
        left.add(descLabel);
        left.add(Box.createVerticalStrut(8));
        left.add(ownerLabel);
        if (!contactLabel.getText().isEmpty()) {
            left.add(Box.createVerticalStrut(4));
            left.add(contactLabel);
        }
        // Always add the pets label, even if empty (it will be hidden if empty)
        if (petsLabel.getText() != null && !petsLabel.getText().isEmpty()) {
            left.add(Box.createVerticalStrut(4));
            left.add(petsLabel);
        }
        left.add(Box.createVerticalStrut(4));
        left.add(idLabel);
        left.add(Box.createVerticalStrut(4));
        left.add(coordinatesLabel);
        if (alert.getEmergencyFee() > 0) {
            left.add(Box.createVerticalStrut(4));
            left.add(feeLabel);
        }
        
        // Right side - Expand/Collapse button and Responded button
        JPanel right = new JPanel();
        right.setLayout(new BoxLayout(right, BoxLayout.Y_AXIS));
        right.setOpaque(false);
        
        // Create expand/collapse button
        String buttonLabel = expandedStates.get(index) ? "▲" : "▼";
        CustomButton expandButton = new CustomButton(buttonLabel);
        expandButton.setPreferredSize(new Dimension(30, 30));
        expandButton.setFont(expandButton.getFont().deriveFont(12f));
        expandButton.addActionListener(e -> toggleAlertCard(index));
        
        // Create responded button
        CustomButton respondedButton = new CustomButton("Mark Responded");
        respondedButton.setPreferredSize(new Dimension(120, 30));
        respondedButton.setFont(respondedButton.getFont().deriveFont(10f));
        respondedButton.setBackground(new Color(46, 204, 113)); // Green color
        respondedButton.setForeground(Color.WHITE);
        respondedButton.addActionListener(e -> markAlertAsResponded(alert, index));
        
        right.add(expandButton);
        right.add(Box.createVerticalStrut(8));
        right.add(respondedButton);
        right.add(Box.createVerticalGlue());
        
        card.add(left, BorderLayout.CENTER);
        card.add(right, BorderLayout.EAST);
        
        // Add click listener for the entire card
        card.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        card.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                // If this alert is already selected, deselect it
                if (selectedAlert != null && selectedAlert.getId().equals(alert.getId())) {
                    // Deselect the alert
                    selectedAlert = null;
                    if (selectedCard != null) {
                        selectedCard.setBackground(new Color(245, 245, 245)); // Reset to normal color
                    }
                    selectedCard = null;
                    // Notify the dashboard that the alert was deselected
                    alertDeselectListener.run();
                } else {
                    // Select this alert
                    if (selectedCard != null) {
                        selectedCard.setBackground(new Color(245, 245, 245)); // Reset previous selection
                    }
                    card.setBackground(new Color(220, 220, 220)); // Highlight selected card
                    selectedAlert = alert;
                    selectedCard = card;
                    alertClickListener.accept(alert);
                }
            }
        });
        
        return card;
    }
    
    private void toggleAlertCard(int index) {
        // Toggle the expanded state
        boolean currentState = expandedStates.get(index);
        expandedStates.set(index, !currentState);
        
        // Rebuild the card with new height
        JPanel newCard = createAlertCard(alerts.get(index), index);
        alertListPanel.remove(index);
        alertListPanel.add(newCard, index);
        alertListPanel.revalidate();
        alertListPanel.repaint();
    }
    
    private int getCardHeight(int index) {
        // Return different heights based on expanded state
        return expandedStates.get(index) ? 180 : 120; // Expanded: 180px, Collapsed: 120px
    }
    
    private String getDisplayDescription(AlertData alert, int index) {
        // Show full description when expanded, truncated when collapsed
        if (expandedStates.get(index) || alert.getDescription().length() <= 100) {
            return alert.getDescription();
        } else {
            return alert.getDescription().substring(0, Math.min(100, alert.getDescription().length())) + "...";
        }
    }
    
    // Helper method to format pets for display in alert cards
    private String formatPetsForAlert(String petsJson) {
        try {
            System.out.println("Debug: formatPetsForAlert called with petsJson = " + petsJson); // Debug line
            if (petsJson == null || petsJson.equals("[]") || petsJson.isEmpty()) {
                System.out.println("Debug: petsJson is null, empty, or []"); // Debug line
                return "";
            }
            
            // Handle case where petsJson might be already formatted string
            if (!petsJson.trim().startsWith("[")) {
                System.out.println("Debug: petsJson is not JSON array, returning as is"); // Debug line
                return petsJson;
            }
            
            com.google.gson.JsonArray petsArray = com.google.gson.JsonParser.parseString(petsJson).getAsJsonArray();
            System.out.println("Debug: petsArray size = " + petsArray.size()); // Debug line
            if (petsArray.size() == 0) {
                System.out.println("Debug: petsArray is empty"); // Debug line
                return "";
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
            
            String finalResult = result.toString();
            System.out.println("Debug: finalResult = " + finalResult); // Debug line
            return finalResult;
        } catch (Exception e) {
            System.err.println("Error parsing pets JSON for alert: " + e.getMessage());
            e.printStackTrace();
            // Try to return the raw string if JSON parsing fails
            return petsJson != null ? petsJson : "";
        }
    }
    
    // Method to mark an alert as responded
    private void markAlertAsResponded(AlertData alert, int index) {
        // Notify the dashboard that this alert has been responded to
        if (alertClickListener instanceof AlertResponseListener) {
            ((AlertResponseListener) alertClickListener).onAlertResponded(alert);
        }
        
        // Notify the remove listener if set
        if (alertRemoveListener != null) {
            alertRemoveListener.accept(alert);
        }
        
        // Remove the alert from the panel
        removeAlert(alert.getId());
        
        // Show success message
        JOptionPane.showMessageDialog(this, "Alert marked as responded and removed", "Success", JOptionPane.INFORMATION_MESSAGE);
    }
    
    // Method to set the alert remove listener
    public void setAlertRemoveListener(Consumer<AlertData> listener) {
        this.alertRemoveListener = listener;
    }
    
    // Method to remove an alert by ID
    public void removeAlert(String alertId) {
        for (int i = 0; i < alerts.size(); i++) {
            if (alerts.get(i).getId().equals(alertId)) {
                // Remove from data structures
                alerts.remove(i);
                expandedStates.remove(i);
                
                // Remove from UI
                alertListPanel.remove(i);
                alertListPanel.revalidate();
                alertListPanel.repaint();
                break;
            }
        }
    }
    
    // Interface for alert response listener
    public interface AlertResponseListener {
        void onAlertResponded(AlertData alert);
    }
    
    public static class AlertData {
        private final String title;
        private final String description;
        private final String owner;
        private final String id;
        private final double lat;
        private final double lng;
        private final String pets; // Added pets field
        private final String contactInfo; // Added contact information field
        private final int emergencyFee; // Added emergency fee field
        
        // Private constructor used by Builder
        private AlertData(Builder builder) {
            this.title = builder.title;
            this.description = builder.description;
            this.owner = builder.owner;
            this.id = builder.id;
            this.lat = builder.lat;
            this.lng = builder.lng;
            this.pets = builder.pets != null ? builder.pets : "[]";
            this.contactInfo = builder.contactInfo != null ? builder.contactInfo : "";
            this.emergencyFee = builder.emergencyFee;
        }
        
        // Getters for all fields
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getOwner() { return owner; }
        public String getId() { return id; }
        public double getLat() { return lat; }
        public double getLng() { return lng; }
        public String getPets() { return pets; }
        public String getContactInfo() { return contactInfo; }
        public int getEmergencyFee() { return emergencyFee; }
        
        // Builder class
        public static class Builder {
            // Required parameters
            private String title;
            private String description;
            private String owner;
            private String id;
            private double lat;
            private double lng;
            
            // Optional parameters with default values
            private String pets = "[]";
            private String contactInfo = "";
            private int emergencyFee = 0;
            
            public Builder(String title, String description, String owner, String id, double lat, double lng) {
                this.title = title;
                this.description = description;
                this.owner = owner;
                this.id = id;
                this.lat = lat;
                this.lng = lng;
            }
            
            public Builder pets(String pets) {
                this.pets = pets;
                return this;
            }
            
            public Builder contactInfo(String contactInfo) {
                this.contactInfo = contactInfo;
                return this;
            }
            
            public Builder emergencyFee(int emergencyFee) {
                this.emergencyFee = emergencyFee;
                return this;
            }
            
            public AlertData build() {
                return new AlertData(this);
            }
        }
    }
    
    // Custom button class for the expand/collapse button
    public static class CustomButton extends JButton {
        public CustomButton(String text) {
            super(text);
            setFocusPainted(false);
            setBorderPainted(false);
            setContentAreaFilled(false);
            setOpaque(true);
            setBackground(new Color(200, 200, 200));
            setForeground(Color.BLACK);
        }
        
        @Override
        protected void paintComponent(Graphics g) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            
            // Draw background
            g2.setColor(getBackground());
            g2.fillRoundRect(0, 0, getWidth(), getHeight(), 10, 10);
            
            // Draw border
            g2.setColor(new Color(150, 150, 150));
            g2.drawRoundRect(0, 0, getWidth() - 1, getHeight() - 1, 10, 10);
            
            // Draw text
            g2.setColor(getForeground());
            FontMetrics fm = g2.getFontMetrics();
            int x = (getWidth() - fm.stringWidth(getText())) / 2;
            int y = (getHeight() + fm.getAscent() - fm.getLeading() - fm.getDescent()) / 2;
            g2.drawString(getText(), x, y);
            
            g2.dispose();
        }
    }
}