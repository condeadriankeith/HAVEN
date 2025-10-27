package com.haven;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

public class HavenDashboard extends JFrame {

    private CardLayout centerCardLayout;
    private JPanel centerCardPanel;
    private MapPanel mapPanel;
    private AlertPanel alertPanel;
    private AtomicInteger markerCounter = new AtomicInteger(0);

    public HavenDashboard() {
        setTitle("HAVEN - Pet Emergency Response Dashboard");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(1400, 900);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());
        initUI();
    }

    private void initUI() {
        // Top bar
        JPanel topBar = createTopBar();
        add(topBar, BorderLayout.NORTH);

        // Left sidebar - redesigned with icons at top
        JPanel leftSidebar = createLeftSidebar();
        add(leftSidebar, BorderLayout.WEST);

        // Right alerts panel
        alertPanel = new AlertPanel(this::onAlertClicked, this::simulateAddAlert);
        add(alertPanel, BorderLayout.EAST);

        // Center area with CardLayout
        centerCardLayout = new CardLayout();
        centerCardPanel = new JPanel(centerCardLayout);

        // Map page
        mapPanel = new MapPanel();
        centerCardPanel.add(mapPanel, "MAP");

        // Analytics page (simple placeholder)
        centerCardPanel.add(createAnalyticsPanel(), "ANALYTICS");

        add(centerCardPanel, BorderLayout.CENTER);

        // Start at Map
        centerCardLayout.show(centerCardPanel, "MAP");
    }

    private JPanel createTopBar() {
        JPanel top = new RoundedPanel();
        top.setBackground(Color.WHITE);
        top.setPreferredSize(new Dimension(10, 64));
        top.setLayout(new BorderLayout(10, 10));
        top.setBorder(BorderFactory.createEmptyBorder(10, 16, 10, 16));

        JLabel title = new JLabel("HAVEN — Emergency Response");
        title.setFont(title.getFont().deriveFont(Font.BOLD, 18f));
        title.setForeground(Color.RED.darker());
        top.add(title, BorderLayout.WEST);

        JPanel right = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 8));
        right.setOpaque(false);

        JLabel dt = new JLabel("Region: Barangay 7  |  " + java.time.LocalDateTime.now().toString().replace('T', ' '));
        dt.setForeground(Color.DARK_GRAY);
        right.add(dt);

        CustomButton profile = new CustomButton("Profile");
        profile.addActionListener(e -> JOptionPane.showMessageDialog(this, "Profile page (placeholder)"));
        right.add(profile);

        top.add(right, BorderLayout.EAST);
        return top;
    }

    private JPanel createLeftSidebar() {
        JPanel left = new JPanel();
        left.setLayout(new BorderLayout());
        left.setBackground(Color.WHITE);
        left.setPreferredSize(new Dimension(80, 0));
        left.setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));

        // Top panel for icons
        JPanel iconPanel = new JPanel();
        iconPanel.setLayout(new BoxLayout(iconPanel, BoxLayout.Y_AXIS));
        iconPanel.setBackground(Color.WHITE);
        iconPanel.setBorder(BorderFactory.createEmptyBorder(10, 0, 10, 0));

        // Map icon button
        CustomButton btnMap = new CustomButton("🗺️");
        btnMap.setPreferredSize(new Dimension(50, 50));
        btnMap.setMaximumSize(new Dimension(50, 50));
        btnMap.setFont(btnMap.getFont().deriveFont(20f));
        btnMap.addActionListener(e -> centerCardLayout.show(centerCardPanel, "MAP"));
        iconPanel.add(btnMap);
        iconPanel.add(Box.createVerticalStrut(15));

        // Analytics icon button
        CustomButton btnAnalytics = new CustomButton("📊");
        btnAnalytics.setPreferredSize(new Dimension(50, 50));
        btnAnalytics.setMaximumSize(new Dimension(50, 50));
        btnAnalytics.setFont(btnAnalytics.getFont().deriveFont(20f));
        btnAnalytics.addActionListener(e -> centerCardLayout.show(centerCardPanel, "ANALYTICS"));
        iconPanel.add(btnAnalytics);
        iconPanel.add(Box.createVerticalStrut(15));

        // Users icon button
        CustomButton btnUsers = new CustomButton("👤");
        btnUsers.setPreferredSize(new Dimension(50, 50));
        btnUsers.setMaximumSize(new Dimension(50, 50));
        btnUsers.setFont(btnUsers.getFont().deriveFont(20f));
        btnUsers.addActionListener(e -> JOptionPane.showMessageDialog(this, "Users page placeholder."));
        iconPanel.add(btnUsers);

        // Bottom panel for spacer
        JPanel bottomPanel = new JPanel();
        bottomPanel.setBackground(Color.WHITE);
        bottomPanel.setLayout(new BorderLayout());

        left.add(iconPanel, BorderLayout.NORTH);
        left.add(bottomPanel, BorderLayout.CENTER);

        return left;
    }

    private JPanel createAnalyticsPanel() {
        JPanel p = new RoundedPanel();
        p.setLayout(new BorderLayout(10, 10));
        p.setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));
        JLabel lbl = new JLabel("Analytics Dashboard");
        lbl.setFont(lbl.getFont().deriveFont(Font.BOLD, 20f));
        p.add(lbl, BorderLayout.NORTH);

        JPanel cards = new JPanel(new GridLayout(1, 3, 12, 12));
        cards.setOpaque(false);
        cards.add(createStatCard("Total Reports", "1842"));
        cards.add(createStatCard("Processing", "42"));
        cards.add(createStatCard("Avg. Response", "7m 22s"));
        p.add(cards, BorderLayout.CENTER);
        return p;
    }

    private JPanel createStatCard(String title, String value) {
        RoundedPanel card = new RoundedPanel();
        card.setPreferredSize(new Dimension(200, 120));
        card.setLayout(new BorderLayout());
        card.setBorder(BorderFactory.createEmptyBorder(12, 12, 12, 12));
        JLabel t = new JLabel(title); t.setForeground(Color.DARK_GRAY);
        JLabel v = new JLabel(value); v.setFont(v.getFont().deriveFont(Font.BOLD, 22f)); v.setForeground(Color.RED.darker());
        card.add(t, BorderLayout.NORTH);
        card.add(v, BorderLayout.CENTER);
        return card;
    }

    private void onAlertClicked(AlertPanel.AlertData data) {
        // center and highlight marker on map
        mapPanel.centerOn(data.lat, data.lng);
        mapPanel.addMarker(data.lat, data.lng, data.title, true);
    }

    private void simulateAddAlert() {
        // create mock alert and add to alert panel & map
        double lat = 10.6765 + Math.random() * 0.02 - 0.01;
        double lng = 122.9509 + Math.random() * 0.02 - 0.01;
        String id = "ALRT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String title = "Pet Emergency " + markerCounter.incrementAndGet();
        alertPanel.addAlert(new AlertPanel.AlertData(title, "Location sample", "Owner", id, lat, lng));
        mapPanel.addMarker(lat, lng, title, false);
    }
}