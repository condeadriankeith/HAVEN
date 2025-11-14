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
    
    // Constants for vet hub location (SM City Bacolod)
    private static final double VET_HUB_LAT = 10.6722;
    private static final double VET_HUB_LNG = 122.9443;
    private boolean vetHubMarkerAdded = false;

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
        
        /* Vet hub marker (green) */
        .vet-hub-marker {
            width: 20px;
            height: 20px;
            background-color: #4CAF50;
            border-radius: 50%;
            position: relative;
            margin: 10px;
            border: 2px solid white;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
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
        
        /* Route line style */
        .route-line {
            stroke: #ff0000; /* Red color as requested */
            stroke-width: 4;
            stroke-opacity: 0.8;
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
        var vetHubMarker = null;
        var routeLine = null;
        
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
        
        // Function to create vet hub icon
        function createVetHubIcon() {
            var icon = L.divIcon({
                className: 'lottie-marker',
                html: '<div class="vet-hub-marker"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            });
            return icon;
        }
        
        // Add vet hub marker when map initializes
        function addVetHubMarker() {
            if (vetHubMarker === null) {
                var icon = createVetHubIcon();
                vetHubMarker = L.marker([10.6722, 122.9443], {icon: icon}).addTo(map);
                vetHubMarker.bindPopup('<b>Vet Hub</b><br>SM City Bacolod');
                // Make sure the vet hub marker is always on top
                vetHubMarker.bringToFront();
                console.log('Vet hub marker added to map');
            }
        }
        
        // Ensure vet hub marker is added when the map is ready
        map.whenReady(function() {
            addVetHubMarker();
        });
        
        // Add marker function (called from Java)
        function addMarker(lat, lng, title, highlight, emergencyId) {
            try {
                console.log('Adding marker at:', lat, lng, 'with title:', title, 'and emergencyId:', emergencyId);
                var icon = createPulseIcon(highlight);
                var marker = L.marker([lat, lng], {icon: icon}).addTo(map);
                
                // Store the emergencyId with the marker for later removal
                marker.emergencyId = emergencyId;
                
                // Create popup content with response button
                var popupContent = '<div>' + 
                    '<h3>' + title + '</h3>' +
                    '<button class="response-btn" onclick="respondToEmergency(\'' + (emergencyId || 'EMG-' + Date.now()) + '\')">Respond to Emergency</button>' +
                    '</div>';
                
                marker.bindPopup(popupContent);
                
                // Add click handler to notify Java when marker is clicked
                marker.on('click', function(e) {
                    // Send message to Java application
                    if (typeof javaMarkerClicked !== 'undefined') {
                        javaMarkerClicked(lat, lng, emergencyId);
                    }
                });
                
                // Store marker with emergencyId as key for easy removal
                markers[emergencyId] = marker;
                
                if (highlight) {
                    marker.openPopup();
                }
                
                console.log('Marker added successfully');
                return emergencyId;
            } catch (error) {
                console.error('Error adding marker:', error);
                return null;
            }
        }
        
        // Remove marker function (called from Java)
        function removeMarker(emergencyId) {
            console.log('removeMarker function called with emergencyId:', emergencyId);
            if (markers[emergencyId]) {
                map.removeLayer(markers[emergencyId]);
                delete markers[emergencyId];
                console.log('Marker removed successfully');
            } else {
                console.log('No marker found with emergencyId:', emergencyId);
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
            // Not used in the new implementation, but kept for compatibility
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
        
        // Draw route function (called from Java)
        function drawRoute(coordinates) {
            console.log('drawRoute function called with coordinates:', coordinates);
            // Remove existing route if present
            if (routeLine !== null) {
                map.removeLayer(routeLine);
            }
            
            // Create new polyline
            routeLine = L.polyline(coordinates, {className: 'route-line'}).addTo(map);
            
            // Fit map to show both vet hub and emergency location
            var bounds = L.latLngBounds([
                [10.6722, 122.9443], // Vet hub
                coordinates[coordinates.length - 1] // Last point (emergency location)
            ]);
            map.fitBounds(bounds, {padding: [50, 50]});
            console.log('Route drawn successfully');
        }

        // Hide route function (called from Java)
        function hideRoute() {
            console.log('hideRoute function called');
            if (routeLine !== null) {
                map.removeLayer(routeLine);
                routeLine = null;
                console.log('Route line removed');
            } else {
                console.log('No route line to remove');
            }
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
                        "typeof addMarker !== 'undefined' ? addMarker(%f, %f, '%s', %s, '%s') : console.log('addMarker function not available')", 
                        lat, lng, escapedTitle, highlight ? "true" : "false", emergencyId != null ? emergencyId : "EMG-" + System.currentTimeMillis());
                    System.out.println("Executing JavaScript: " + script);
                    try {
                        webEngine.executeScript(script);
                    } catch (Exception e) {
                        System.err.println("Error executing addMarker JavaScript: " + e.getMessage());
                        e.printStackTrace();
                    }
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
                        "typeof centerOn !== 'undefined' ? centerOn(%f, %f) : console.log('centerOn function not available')", lat, lng);
                    System.out.println("Executing JavaScript: " + script);
                    try {
                        webEngine.executeScript(script);
                    } catch (Exception e) {
                        System.err.println("Error executing centerOn JavaScript: " + e.getMessage());
                        e.printStackTrace();
                    }
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
                String script = "typeof clearMarkers !== 'undefined' ? clearMarkers() : console.log('clearMarkers function not available')";
                System.out.println("Executing JavaScript: " + script);
                try {
                    webEngine.executeScript(script);
                } catch (Exception e) {
                    System.err.println("Error executing clearMarkers JavaScript: " + e.getMessage());
                    // If clearMarkers fails, try to reload the page
                    webEngine.reload();
                }
            }
        });
    }
    
    public void drawRoute(double[][] coordinates) {
        System.out.println("MapPanel.drawRoute called with coordinates array of length: " + coordinates.length);
        Platform.runLater(() -> {
            if (webEngine != null) {
                // Check if the web page is loaded before executing JavaScript
                if (webEngine.getDocument() != null) {
                    // Build JavaScript array string
                    StringBuilder jsArray = new StringBuilder("[");
                    for (int i = 0; i < coordinates.length; i++) {
                        if (i > 0) jsArray.append(",");
                        jsArray.append("[").append(coordinates[i][0]).append(",").append(coordinates[i][1]).append("]");
                    }
                    jsArray.append("]");
                    
                    String script = "typeof drawRoute !== 'undefined' ? drawRoute(" + jsArray.toString() + ") : console.log('drawRoute function not available')";
                    System.out.println("Executing JavaScript: " + script);
                    try {
                        webEngine.executeScript(script);
                    } catch (Exception e) {
                        System.err.println("Error executing drawRoute JavaScript: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.err.println("Web page not loaded yet, cannot draw route");
                }
            } else {
                System.err.println("WebEngine is null, cannot draw route");
            }
        });
    }
    
    public void hideRoute() {
        System.out.println("MapPanel.hideRoute called");
        Platform.runLater(() -> {
            if (webEngine != null) {
                // Check if the web page is loaded before executing JavaScript
                if (webEngine.getDocument() != null) {
                    String script = "typeof hideRoute !== 'undefined' ? hideRoute() : console.log('hideRoute function not available')";
                    System.out.println("Executing JavaScript: " + script);
                    try {
                        webEngine.executeScript(script);
                    } catch (Exception e) {
                        System.err.println("Error executing hideRoute JavaScript: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.err.println("Web page not loaded yet, cannot hide route");
                }
            } else {
                System.err.println("WebEngine is null, cannot hide route");
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
                        "typeof highlightMarker !== 'undefined' ? highlightMarker(%f, %f) : console.log('highlightMarker function not available')", lat, lng);
                    System.out.println("Executing JavaScript: " + script);
                    try {
                        webEngine.executeScript(script);
                    } catch (Exception e) {
                        System.err.println("Error executing highlightMarker JavaScript: " + e.getMessage());
                        e.printStackTrace();
                    }
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
    
    // Method to remove a marker by emergency ID
    public void removeMarker(String emergencyId) {
        System.out.println("MapPanel.removeMarker called with emergencyId: " + emergencyId);
        Platform.runLater(() -> {
            if (webEngine != null) {
                // Check if the web page is loaded before executing JavaScript
                if (webEngine.getDocument() != null) {
                    String script = String.format(
                        "typeof removeMarker !== 'undefined' ? removeMarker('%s') : console.log('removeMarker function not available')", emergencyId);
                    System.out.println("Executing JavaScript: " + script);
                    try {
                        webEngine.executeScript(script);
                    } catch (Exception e) {
                        System.err.println("Error executing removeMarker JavaScript: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.err.println("Web page not loaded yet, cannot remove marker");
                }
            } else {
                System.err.println("WebEngine is null, cannot remove marker");
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
    
    public void setMarkerClickListener(MarkerClickListener listener) {
        Platform.runLater(() -> {
            if (webEngine != null) {
                webEngine.executeScript(
                    "window.javaMarkerClicked = function(lat, lng, emergencyId) {" +
                    "    console.log('Marker clicked: ' + lat + ', ' + lng + ', ' + emergencyId);" +
                    "    // In a real implementation, this would call back to Java" +
                    "    // For now, we'll simulate the behavior by calling the Java method directly" +
                    "    // This requires JSObject integration which is not shown here" +
                    "};"
                );
            }
        });
    }
    
    public interface EmergencyResponseListener {
        void onEmergencyResponse(String emergencyId);
    }
    
    public interface MarkerClickListener {
        void onMarkerClick(double lat, double lng, String emergencyId);
    }

}