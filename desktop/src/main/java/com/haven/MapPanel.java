package com.haven;

import javafx.application.Platform;
import javafx.embed.swing.JFXPanel;
import javafx.scene.Scene;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;

import javax.swing.*;
import java.awt.*;
import java.net.URL;

public class MapPanel extends JPanel {
    private final JFXPanel fxPanel;
    private WebEngine webEngine;

    public MapPanel() {
        setLayout(new BorderLayout());
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
            // Fallback to embedded HTML
            String mapHtml = """
<!DOCTYPE html>
<html>
<head>
    <title>HAVEN Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background: #f5f5f5;
        }
        #map {
            width: 100%;
            height: 100%;
        }
        .marker-highlight {
            filter: hue-rotate(180deg) saturate(2);
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
        
        // Add marker function (called from Java)
        function addMarker(lat, lng, title, highlight) {
            var marker = L.marker([lat, lng]).addTo(map)
                .bindPopup(title);
            
            var id = 'marker_' + lat + '_' + lng;
            markers[id] = marker;
            
            if (highlight) {
                marker.openPopup();
            }
            
            return id;
        }
        
        // Center on location function (called from Java)
        function centerOn(lat, lng) {
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
                    lat, lng, title, highlight ? "true" : "false"));
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