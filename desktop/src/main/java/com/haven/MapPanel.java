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
        
        // Add marker function (called from Java)
        function addMarker(lat, lng, title, highlight) {
            var markerIcon = createLottieIcon();
            var marker = L.marker([lat, lng], {icon: markerIcon}).addTo(map)
                .bindPopup(title);
            
            var id = 'marker_' + lat + '_' + lng;
            markers[id] = marker;
            
            // Load animation after a short delay to ensure DOM is ready
            setTimeout(() => {
                var lottieContainer = marker._icon.querySelector('.lottie-container');
                if (lottieContainer) {
                    // Create pulsing red circle animation as fallback
                    lottieContainer.innerHTML = '<div class="pulse-circle"></div>';
                    var pulseCircle = lottieContainer.querySelector('.pulse-circle');
                    if (pulseCircle) {
                        pulseCircle.style.cssText = `
                            width: 20px;
                            height: 20px;
                            background-color: #ff3b30;
                            border-radius: 50%;
                            position: relative;
                            animation: pulse 1.5s infinite ease-out;
                        `;
                        
                        // Add CSS animation
                        var style = document.createElement('style');
                        style.innerHTML = `
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
                        `;
                        document.head.appendChild(style);
                    }
                }
            }, 100);
            
            if (highlight) {
                marker.openPopup();
            }
            
            return id;
        }
        
        // Center on location function (called from Java)
        function centerOn(lat, lng) {
            console.log("Centering map on coordinates:", lat, lng);
            // Make sure coordinates are in the correct order (latitude, longitude)
            // Leaflet uses [latitude, longitude] format
            map.setView([lat, lng], 16);
        }
        
        // Highlight marker function (called from Java)
        function highlightMarker(lat, lng) {
            var id = 'marker_' + lat + '_' + lng;
            if (markers[id]) {
                markers[id].openPopup();
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
                webEngine.executeScript(String.format(
                    "addMarker(%f, %f, '%s', %s)", 
                    lat, lng, title.replace("'", "\\'"), highlight ? "true" : "false"));
            }
        });
    }
    
    public void centerOn(double lat, double lng) {
        Platform.runLater(() -> {
            if (webEngine != null) {
                webEngine.executeScript(String.format(
                    "centerOn(%f, %f)", lat, lng));
            }
        });
    }
}