# Map Implementation in HAVEN Desktop

## Overview
The HAVEN desktop application uses a hybrid approach for its map functionality:
- **Java Swing** for the main UI components
- **JavaFX WebView** embedded within Swing for the interactive map
- **Leaflet.js** with **OpenStreetMap** tiles for the map visualization

## Implementation Details

### MapPanel.java
The [MapPanel.java](file:///c:/Users/conde/Downloads/HAVEN/desktop/src/main/java/com/haven/MapPanel.java) class is responsible for:
1. Embedding a JavaFX WebView within a Swing JPanel
2. Loading the map HTML content
3. Providing methods to interact with the map from Java code

### HTML/JavaScript Implementation
The map.html file contains:
1. Leaflet.js library integration
2. OpenStreetMap tile layer configuration
3. Custom JavaScript functions for:
   - Adding markers to the map
   - Centering the map on specific coordinates
   - Highlighting markers

### Communication Between Java and JavaScript
Communication is achieved through:
1. **Java to JavaScript**: Using `webEngine.executeScript()` to call JavaScript functions
2. **JavaScript to Java**: Using JSObject to call Java methods (not currently implemented but possible)

## Features

### Marker Management
- Add markers with custom titles
- Highlight specific markers
- Remove markers (not yet implemented)

### Map Navigation
- Center map on specific coordinates
- Zoom control
- Pan functionality

### Customization
- Custom marker icons (can be extended)
- Map styling through CSS
- Responsive design

## Dependencies

### JavaFX
The application requires JavaFX dependencies:
- javafx-controls
- javafx-web

These are specified in the pom.xml file.

### Leaflet.js
Loaded from CDN:
- Leaflet CSS: https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
- Leaflet JS: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js

## Internet Requirements
The map requires internet access to:
1. Load Leaflet.js library from CDN
2. Load OpenStreetMap tiles

In environments without internet access, the map will not display properly.

## Future Enhancements
1. Offline map support using local tile servers
2. Custom marker icons
3. Map layer switching (satellite, terrain, etc.)
4. Drawing tools (polygons, routes)
5. Geocoding/reverse geocoding integration