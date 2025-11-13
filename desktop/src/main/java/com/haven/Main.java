package com.haven;

import com.formdev.flatlaf.FlatLightLaf;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;

public class Main {
    public static void main(String[] args) {
        // Set FlatLaf look and feel
        try {
            UIManager.setLookAndFeel(new FlatLightLaf());
        } catch (Exception ex) {
            System.err.println("Failed to initialize FlatLaf: " + ex.getMessage());
        }
        
        SwingUtilities.invokeLater(() -> {
            // Directly show the dashboard without login for prototype
            HavenDashboard dashboard = new HavenDashboard();
            dashboard.setVisible(true);
        });
    }
}
