package com.haven;

import javafx.application.Platform;
import javafx.embed.swing.JFXPanel;
import javafx.scene.Scene;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;

import javax.swing.*;
import java.awt.*;
import java.net.URL;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public class MapPanel extends JPanel {
    private final JFXPanel fxPanel;
    private WebEngine webEngine;

    public MapPanel() {
        setLayout(new BorderLayout());
        setBackground(Color.WHITE); // Light theme background
        fxPanel = new JFXPanel();
        add(fxPanel, BorderLayout.CENTER);
        
        // Initialize JavaFX content
        Platform.runLater(this::initFX);
    }
    
    private void initFX() {
        WebView webView = new WebView();
        webEngine = webView.getEngine();
        fxPanel.setScene(new Scene(webView));
        
        // Load the map HTML from resources
        URL mapUrl = getClass().getClassLoader().getResource("web/map.html");
        if (mapUrl != null) {
            webEngine.load(mapUrl.toExternalForm());
        } else {
            // Fallback to embedded HTML with proper alert animation
            String mapHtml = """
<!DOCTYPE html>
<html>
<head>
    <title>HAVEN Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/lottie-web@5.12.2/build/player/lottie.js"></script>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background: #ffffff; /* Light theme background */
            color: #000000; /* Black text */
        }
        #map {
            width: 100%;
            height: 100%;
        }
        .marker-highlight {
            filter: hue-rotate(180deg) saturate(2);
        }
        .lottie-marker {
            width: 40px;
            height: 40px;
        }
        
        /* Animated pulse marker */
        .pulse-circle {
            width: 20px;
            height: 20px;
            background-color: #ff3b30;
            border-radius: 50%;
            position: relative;
            animation: pulse 1.5s infinite ease-out;
            margin: 10px;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(0.8);
                opacity: 0.8;
                box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7);
            }
            70% {
                transform: scale(1.2);
                opacity: 0.5;
                box-shadow: 0 0 0 15px rgba(255, 59, 48, 0);
            }
            100% {
                transform: scale(0.8);
                opacity: 0.8;
                box-shadow: 0 0 0 0 rgba(255, 59, 48, 0);
            }
        }
        
        /* Response button in popup */
        .response-btn {
            background-color: #ff3b30;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 8px;
        }
        
        .response-btn:hover {
            background-color: #ff1a1a;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // Initialize map
        var map = L.map('map').setView([10.6765, 122.9509], 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        var markers = {};
        
        // Function to create Lottie marker icon
        function createLottieIcon() {
            var icon = L.divIcon({
                className: 'lottie-marker',
                html: '<div class="lottie-container" style="width: 40px; height: 40px;"></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            });
            return icon;
        }
        
        // Function to create pulse icon
        function createPulseIcon(highlight) {
            var icon = L.divIcon({
                className: 'lottie-marker',
                html: '<div class="pulse-circle"></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            });
            return icon;
        }
        
        // Add marker function (called from Java)
        function addMarker(lat, lng, title, highlight, emergencyId) {
            try {
                console.log('Adding marker at:', lat, lng, 'with title:', title);
                var icon = createPulseIcon(highlight);
                var marker = L.marker([lat, lng], {icon: icon}).addTo(map);
                
                // Create popup content with response button
                var popupContent = '<div>' + 
                    '<h3>' + title + '</h3>' +
                    '<button class="response-btn" onclick="respondToEmergency(\'' + (emergencyId || 'EMG-' + Date.now()) + '\')">Respond to Emergency</button>' +
                    '</div>';
                
                marker.bindPopup(popupContent);
                
                var id = 'marker_' + lat + '_' + lng;
                markers[id] = marker;
                
                if (highlight) {
                    marker.openPopup();
                }
                
                console.log('Marker added successfully');
                return id;
            } catch (error) {
                console.error('Error adding marker:', error);
                return null;
            }
        }
        
        // Respond to emergency function (called when response button is clicked)
        function respondToEmergency(emergencyId) {
            // Send message to Java application
            if (typeof javaRespondToEmergency !== 'undefined') {
                javaRespondToEmergency(emergencyId);
            } else {
                alert('Responding to emergency: ' + emergencyId);
            }
        }
        
        // Center on location function (called from Java)
        function centerOn(lat, lng) {
            try {
                console.log("Centering map on coordinates:", lat, lng);
                // Make sure coordinates are in the correct order (latitude, longitude)
                // Leaflet uses [latitude, longitude] format
                map.setView([lat, lng], 16);
                console.log("Map centered successfully");
            } catch (error) {
                console.error("Error centering map:", error);
            }
        }
        
        // Highlight marker function (called from Java)
        function highlightMarker(lat, lng) {
            var id = 'marker_' + lat + '_' + lng;
            if (markers[id]) {
                markers[id].openPopup();
            }
        }
        
        // Clear all markers function (called from Java)
        function clearMarkers() {
            for (var id in markers) {
                map.removeLayer(markers[id]);
            }
            markers = {};
        }
    </script>
</body>
</html>
""";
            webEngine.loadContent(mapHtml);
        }
    }
    
    public void addMarker(double lat, double lng, String title, boolean highlight) {
        Platform.runLater(() -> {
            if (webEngine != null) {
                // Escape single quotes in the title to prevent JavaScript errors
                String escapedTitle = title.replace("'", "\\'");
                webEngine.executeScript(String.format(
                    "addMarker(%f, %f, '%s', %s, '%s')", 
                    lat, lng, escapedTitle, highlight ? "true" : "false", "EMG-" + System.currentTimeMillis()));
            }
        });
    }

    public void addMarker(double lat, double lng, String title, boolean highlight, String emergencyId) {
        System.out.println("MapPanel.addMarker called with: lat=" + lat + ", lng=" + lng + ", title=" + title + ", highlight=" + highlight + ", emergencyId=" + emergencyId);
        Platform.runLater(() -> {
            if (webEngine != null) {
                // Check if the web page is loaded before executing JavaScript
                if (webEngine.getDocument() != null) {
                    // Escape single quotes in the title to prevent JavaScript errors
                    String escapedTitle = title.replace("'", "\\'");
                    String script = String.format(
                        "addMarker(%f, %f, '%s', %s, '%s')", 
                        lat, lng, escapedTitle, highlight ? "true" : "false", emergencyId != null ? emergencyId : "EMG-" + System.currentTimeMillis());
                    System.out.println("Executing JavaScript: " + script);
                    webEngine.executeScript(script);
                } else {
                    System.err.println("Web page not loaded yet, cannot add marker");
                    // Retry after a short delay
                    Platform.runLater(() -> {
                        try {
                            Thread.sleep(100);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                        addMarker(lat, lng, title, highlight, emergencyId);
                    });
                }
            } else {
                System.err.println("WebEngine is null, cannot add marker");
            }
        });
    }
    
    public void centerOn(double lat, double lng) {
        System.out.println("MapPanel.centerOn called with: lat=" + lat + ", lng=" + lng);
        Platform.runLater(() -> {
            if (webEngine != null) {
                // Check if the web page is loaded before executing JavaScript
                if (webEngine.getDocument() != null) {
                    String script = String.format(
                        "centerOn(%f, %f)", lat, lng);
                    System.out.println("Executing JavaScript: " + script);
                    webEngine.executeScript(script);
                } else {
                    System.err.println("Web page not loaded yet, cannot center map");
                    // Retry after a short delay
                    Platform.runLater(() -> {
                        try {
                            Thread.sleep(100);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                        centerOn(lat, lng);
                    });
                }
            } else {
                System.err.println("WebEngine is null, cannot center map");
            }
        });
    }
    
    public void clearMarkers() {
        Platform.runLater(() -> {
            if (webEngine != null) {
                try {
                    webEngine.executeScript("typeof clearMarkers !== 'undefined' ? clearMarkers() : console.log('clearMarkers function not available yet')");
                } catch (Exception e) {
                    System.err.println("Error clearing markers: " + e.getMessage());
                    // If clearMarkers fails, try to reload the page
                    webEngine.reload();
                }
            }
        });
    }
    
    public void highlightMarker(double lat, double lng) {
        System.out.println("MapPanel.highlightMarker called with: lat=" + lat + ", lng=" + lng);
        Platform.runLater(() -> {
            if (webEngine != null) {
                // Check if the web page is loaded before executing JavaScript
                if (webEngine.getDocument() != null) {
                    String script = String.format(
                        "highlightMarker(%f, %f)", lat, lng);
                    System.out.println("Executing JavaScript: " + script);
                    webEngine.executeScript(script);
                } else {
                    System.err.println("Web page not loaded yet, cannot highlight marker");
                    // Retry after a short delay
                    Platform.runLater(() -> {
                        try {
                            Thread.sleep(100);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                        highlightMarker(lat, lng);
                    });
                }
            } else {
                System.err.println("WebEngine is null, cannot highlight marker");
            }
        });
    }
    
    public void setEmergencyResponseListener(EmergencyResponseListener listener) {
        Platform.runLater(() -> {
            if (webEngine != null) {
                // Set up a JS function that can call back to Java
                webEngine.executeScript(
                    "window.javaRespondToEmergency = function(emergencyId) {" +
                    "    // This would call back to Java in a real implementation" +
                    "    console.log('Responding to emergency: ' + emergencyId);" +
                    "    // In a real implementation, you would use JSObject to call Java methods" +
                    "    alert('Responding to emergency: ' + emergencyId);" +
                    "};"
                );
            }
        });
    }
    
    public interface EmergencyResponseListener {
        void onEmergencyResponse(String emergencyId);
    }
}