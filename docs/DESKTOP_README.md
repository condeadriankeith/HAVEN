# HAVEN Desktop Application

## Overview
The HAVEN desktop application is an emergency response dashboard built with Java Swing for the UI components and JavaFX WebView for embedding a live map using Leaflet and OpenStreetMap.

## Features
- Interactive map with animated pulse markers for pet emergency locations (red color to match UI)
- Real-time alert monitoring with clickable alert cards
- Analytics dashboard
- Responsive UI with custom-styled components
- Modern icon-based navigation

## Prerequisites
- Java 17 or later
- Maven 3.6 or later

## Building the Application
```bash
# Navigate to the desktop directory
cd desktop

# Clean and compile
mvn clean compile

# Package into JAR
mvn package

# Run the application
mvn javafx:run
```

## Running the Application
After building, you can run the application in two ways:

1. Using Maven:
   ```bash
   mvn javafx:run
   ```

2. Using the JAR file (requires JavaFX modules):
   ```bash
   java --module-path /path/to/javafx/lib --add-modules javafx.controls,javafx.web,javafx.swing -jar target/haven-desktop-1.0-SNAPSHOT.jar
   ```

## UI/UX Improvements

### Redesigned Navigation
- Navigation buttons moved to the top of the left panel
- Text labels replaced with intuitive icons:
  - 🗺️ Map view
  - 📊 Analytics view
  - 👤 Users view

### Animated Map Markers
- Pulsing animation effect for better visibility
- **Red color scheme to match UI theme** (#ff0000 for regular, #cc0000 for highlighted)
- Smooth CSS animations

### Enhanced Alert Panel
- Improved card layout with better spacing
- Larger fonts for better readability
- Enhanced visual hierarchy

## Project Structure
```
src/
├── main/
│   ├── java/com/haven/
│   │   ├── Main.java              # Application entry point
│   │   ├── HavenDashboard.java    # Main dashboard frame
│   │   ├── CustomButton.java      # Custom styled button component
│   │   ├── RoundedPanel.java      # Panel with rounded corners
│   │   ├── MapPanel.java          # Map component with JavaFX WebView
│   │   └── AlertPanel.java        # Alerts display panel
│   └── resources/
│       ├── web/map.html           # Map HTML template
│       └── map.html               # Fallback map HTML
```

## Components

### Main.java
Entry point of the application that initializes the Swing UI.

### HavenDashboard.java
Main application window with:
- Top navigation bar
- Left sidebar with icon-based navigation
- Central card layout for switching between views
- Right panel for alerts
- Map and analytics views

### Custom Components
- **CustomButton**: Fully custom rounded button with no default Swing look
- **RoundedPanel**: Panel with rounded corners and subtle drop shadow
- **MapPanel**: Embeds JavaFX WebView inside Swing for Leaflet map
- **AlertPanel**: Displays alerts in a scrollable list with clickable cards

## Notes
- The map requires internet access to load OpenStreetMap tiles
- JavaFX dependencies are managed through Maven
- The application uses a modern light mode theme (white background with red accents)
- A self-contained JAR file is created in the `target/` directory during packaging
- **Animated markers now use red color scheme consistent with the UI theme**