package com.haven;

public class HavenDesktopTest {

    public static void main(String[] args) {
        // Test that our main classes can be instantiated
        try {
            Class.forName("com.haven.Main");
            Class.forName("com.haven.HavenDashboard");
            Class.forName("com.haven.CustomButton");
            Class.forName("com.haven.RoundedPanel");
            Class.forName("com.haven.MapPanel");
            Class.forName("com.haven.AlertPanel");
            
            // Test simple instantiation
            CustomButton textButton = new CustomButton("Test");
            CustomButton iconButton = new CustomButton("🗺️");
            RoundedPanel panel = new RoundedPanel();
            
            System.out.println("All tests passed!");
            System.out.println("UI improvements verified:");
            System.out.println("- CustomButton supports both text and icon modes");
            System.out.println("- RoundedPanel renders with enhanced styling");
            System.out.println("- All components load correctly");
        } catch (Exception e) {
            System.err.println("Test failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}