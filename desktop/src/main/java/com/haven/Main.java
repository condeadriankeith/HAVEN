package com.haven;

import javax.swing.SwingUtilities;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            // Directly show the dashboard without login
            HavenDashboard dashboard = new HavenDashboard();
            dashboard.setVisible(true);
        });
    }
}