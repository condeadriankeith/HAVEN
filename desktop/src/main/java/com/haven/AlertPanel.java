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
    private final Runnable addAlertListener;

    public AlertPanel(Consumer<AlertData> alertClickListener, Runnable addAlertListener) {
        this.alertClickListener = alertClickListener;
        this.addAlertListener = addAlertListener;
        
        setPreferredSize(new Dimension(320, 0)); // Slightly wider
        setBackground(Color.WHITE);
        setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        setLayout(new BorderLayout());
        
        // Header
        JPanel header = new RoundedPanel();
        header.setPreferredSize(new Dimension(0, 60)); // Taller header
        header.setLayout(new BorderLayout());
        header.setBorder(BorderFactory.createEmptyBorder(10, 15, 10, 15));
        
        JLabel title = new JLabel("Recent Alerts");
        title.setFont(title.getFont().deriveFont(Font.BOLD, 18f)); // Larger font
        title.setForeground(Color.RED.darker());
        header.add(title, BorderLayout.WEST);
        
        CustomButton addAlertBtn = new CustomButton("+");
        addAlertBtn.setPreferredSize(new Dimension(40, 40));
        addAlertBtn.setFont(addAlertBtn.getFont().deriveFont(20f));
        addAlertBtn.addActionListener(e -> addAlertListener.run());
        header.add(addAlertBtn, BorderLayout.EAST);
        
        add(header, BorderLayout.NORTH);
        
        // Scrollable alert list
        alertListPanel = new JPanel();
        alertListPanel.setLayout(new BoxLayout(alertListPanel, BoxLayout.Y_AXIS));
        alertListPanel.setBackground(Color.WHITE);
        
        JScrollPane scrollPane = new JScrollPane(alertListPanel);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_NEVER);
        scrollPane.setBorder(BorderFactory.createEmptyBorder());
        
        // Customize scrollbar
        scrollPane.getVerticalScrollBar().setUnitIncrement(16);
        
        add(scrollPane, BorderLayout.CENTER);
    }
    
    public void addAlert(AlertData alert) {
        alerts.add(0, alert); // Add to the beginning of the list
        
        // Create alert card
        JPanel card = new RoundedPanel();
        card.setPreferredSize(new Dimension(0, 120)); // Taller cards
        card.setMaximumSize(new Dimension(Integer.MAX_VALUE, 120));
        card.setLayout(new BorderLayout(10, 10));
        card.setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));
        card.setBackground(Color.WHITE);
        
        // Left side - Title and description
        JPanel left = new JPanel();
        left.setLayout(new BoxLayout(left, BoxLayout.Y_AXIS));
        left.setOpaque(false);
        
        JLabel titleLabel = new JLabel(alert.title);
        titleLabel.setFont(titleLabel.getFont().deriveFont(Font.BOLD, 15f)); // Larger title
        titleLabel.setForeground(Color.BLACK);
        
        JLabel descLabel = new JLabel("<html><p>" + alert.description + "</p></html>");
        descLabel.setFont(descLabel.getFont().deriveFont(13f));
        descLabel.setForeground(Color.DARK_GRAY);
        descLabel.setVerticalAlignment(SwingConstants.TOP);
        
        JLabel ownerLabel = new JLabel("Reported by: " + alert.owner);
        ownerLabel.setFont(ownerLabel.getFont().deriveFont(12f));
        ownerLabel.setForeground(Color.GRAY);
        
        left.add(titleLabel);
        left.add(Box.createVerticalStrut(5));
        left.add(descLabel);
        left.add(Box.createVerticalStrut(8));
        left.add(ownerLabel);
        
        // Right side - ID and time
        JPanel right = new JPanel();
        right.setLayout(new BoxLayout(right, BoxLayout.Y_AXIS));
        right.setOpaque(false);
        
        JLabel idLabel = new JLabel(alert.id);
        idLabel.setFont(idLabel.getFont().deriveFont(Font.BOLD, 12f));
        idLabel.setForeground(Color.RED.darker());
        
        JLabel timeLabel = new JLabel("Just now");
        timeLabel.setFont(timeLabel.getFont().deriveFont(11f));
        timeLabel.setForeground(Color.GRAY);
        
        right.add(idLabel);
        right.add(Box.createVerticalGlue());
        right.add(timeLabel);
        
        card.add(left, BorderLayout.CENTER);
        card.add(right, BorderLayout.EAST);
        
        // Add click listener
        card.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
        card.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                alertClickListener.accept(alert);
            }
        });
        
        // Add to the top of the list
        alertListPanel.add(card, 0);
        alertListPanel.revalidate();
        alertListPanel.repaint();
    }
    
    public static class AlertData {
        public final String title;
        public final String description;
        public final String owner;
        public final String id;
        public final double lat;
        public final double lng;
        
        public AlertData(String title, String description, String owner, String id, double lat, double lng) {
            this.title = title;
            this.description = description;
            this.owner = owner;
            this.id = id;
            this.lat = lat;
            this.lng = lng;
        }
    }
}