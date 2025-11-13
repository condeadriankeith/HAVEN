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
    // Keep track of expanded state for each alert card
    private final List<Boolean> expandedStates = new ArrayList<>();

    // Updated constructor to remove the unused addAlertListener parameter
    public AlertPanel(Consumer<AlertData> alertClickListener) {
        this.alertClickListener = alertClickListener;
        // this.addAlertListener = addAlertListener; // Removed
        
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
        
        // Removed the add (+) button as it's no longer needed
        // CustomButton addAlertBtn = new CustomButton("+");
        // addAlertBtn.setPreferredSize(new Dimension(40, 40));
        // addAlertBtn.setFont(addAlertBtn.getFont().deriveFont(20f));
        // addAlertBtn.addActionListener(e -> addAlertListener.run());
        // header.add(addAlertBtn, BorderLayout.EAST);
        
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
        
        JLabel titleLabel = new JLabel(alert.title);
        titleLabel.setFont(titleLabel.getFont().deriveFont(Font.BOLD, 15f)); // Larger title
        titleLabel.setForeground(Color.BLACK);
        
        JLabel descLabel = new JLabel("<html><p>" + getDisplayDescription(alert, index) + "</p></html>");
        descLabel.setFont(descLabel.getFont().deriveFont(13f));
        descLabel.setForeground(Color.DARK_GRAY);
        descLabel.setVerticalAlignment(SwingConstants.TOP);
        
        JLabel ownerLabel = new JLabel("Reported by: " + alert.owner);
        ownerLabel.setFont(ownerLabel.getFont().deriveFont(12f));
        ownerLabel.setForeground(Color.GRAY);
        
        // Add contact information if available
        JLabel contactLabel = new JLabel();
        if (alert.contactInfo != null && !alert.contactInfo.isEmpty()) {
            contactLabel.setText("Contact: " + alert.contactInfo);
            contactLabel.setFont(contactLabel.getFont().deriveFont(12f));
            contactLabel.setForeground(Color.GRAY);
        }
        
        // Add pet information if available
        JLabel petsLabel = new JLabel();
        System.out.println("Debug: alert.pets = " + alert.pets); // Debug line
        if (alert.pets != null && !alert.pets.equals("[]") && !alert.pets.isEmpty()) {
            String petsText = formatPetsForAlert(alert.pets);
            System.out.println("Debug: petsText = " + petsText); // Debug line
            if (!petsText.isEmpty()) {
                petsLabel.setText("Pets: " + petsText);
                petsLabel.setFont(petsLabel.getFont().deriveFont(12f));
                petsLabel.setForeground(Color.GRAY);
            }
        }
        
        // Add ID and status information
        JLabel idLabel = new JLabel("ID: " + alert.id);
        idLabel.setFont(idLabel.getFont().deriveFont(12f));
        idLabel.setForeground(new Color(255, 59, 48)); // HAVEN Red
        
        JLabel coordinatesLabel = new JLabel("Location: " + String.format("%.4f, %.4f", alert.lat, alert.lng));
        coordinatesLabel.setFont(coordinatesLabel.getFont().deriveFont(12f));
        coordinatesLabel.setForeground(Color.GRAY);
        
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
        
        // Right side - Expand/Collapse button
        JPanel right = new JPanel();
        right.setLayout(new BoxLayout(right, BoxLayout.Y_AXIS));
        right.setOpaque(false);
        
        // Create expand/collapse button
        String buttonLabel = expandedStates.get(index) ? "▲" : "▼";
        CustomButton expandButton = new CustomButton(buttonLabel);
        expandButton.setPreferredSize(new Dimension(30, 30));
        expandButton.setFont(expandButton.getFont().deriveFont(12f));
        expandButton.addActionListener(e -> toggleAlertCard(index));
        
        right.add(expandButton);
        right.add(Box.createVerticalGlue());
        
        card.add(left, BorderLayout.CENTER);
        card.add(right, BorderLayout.EAST);
        
        // Add click listener for the entire card
        card.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        card.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                alertClickListener.accept(alert);
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
        if (expandedStates.get(index) || alert.description.length() <= 100) {
            return alert.description;
        } else {
            return alert.description.substring(0, Math.min(100, alert.description.length())) + "...";
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
    
    public static class AlertData {
        public final String title;
        public final String description;
        public final String owner;
        public final String id;
        public final double lat;
        public final double lng;
        public final String pets; // Added pets field
        public final String contactInfo; // Added contact information field
        
        public AlertData(String title, String description, String owner, String id, double lat, double lng, String pets, String contactInfo) {
            this.title = title;
            this.description = description;
            this.owner = owner;
            this.id = id;
            this.lat = lat;
            this.lng = lng;
            this.pets = pets != null ? pets : "[]";
            this.contactInfo = contactInfo != null ? contactInfo : "";
        }
        
        // Constructor for backward compatibility
        public AlertData(String title, String description, String owner, String id, double lat, double lng, String pets) {
            this(title, description, owner, id, lat, lng, pets, "");
        }
        
        // Constructor for backward compatibility
        public AlertData(String title, String description, String owner, String id, double lat, double lng) {
            this(title, description, owner, id, lat, lng, "[]", "");
        }
    }
    
    // Custom button class for the expand/collapse button
    private static class CustomButton extends JButton {
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