# HAVEN Desktop Application - Modern UI Implementation

## Overview

This implementation provides a fully customized, modern desktop interface for HAVEN's emergency response system using Java Swing with FlatLaf theme. The application features a professional-grade dashboard with dark themes, flat UI components, glowing alert indicators, and clean layout hierarchy.

## Features

### Modern UI Components
- **Custom Styled Components**: All interface elements feature rounded edges instead of sharp corners
- **Flat Design**: Replaced all default Java Swing buttons and controls with custom-styled components
- **Consistent Design Language**: Uniform styling applied across every element and view
- **Dark Theme**: Professional dark theme with charcoal background (#0e1117)

### Layout Structure
- **1920x1080 Resolution**: Main window optimized for fullscreen at 1920x1080 resolution
- **Responsive Design**: Adapts to window resizing
- **Sidebar Navigation**: Vertical sidebar with icons and text labels
- **Interactive Map Area**: Central map panel with emergency markers
- **Alerts Panel**: Right-aligned panel showing latest emergency alerts
- **Top Information Bar**: Header with location, date/time, and weather information

### Color Palette
- **Background**: #0e1117
- **Primary Text**: #e8eaed
- **Secondary Text**: #9aa0a6
- **Accent Red**: #ff3b3b
- **Accent Blue**: #2196f3
- **Accent Yellow**: #ffcc00
- **Panels**: #1a1d22
- **Alert Panels**: #1c1f24

### Custom Components
1. **CustomButton**: Flat buttons with rounded corners and hover effects
2. **RoundedPanel**: Panels with customizable corner radius
3. **MapPanel**: Interactive map panel with alert markers
4. **Sidebar**: Vertical navigation component
5. **TopBar**: Header component with date/time and controls

## Technical Implementation

### Dependencies
- **Java 17**: Primary development language
- **FlatLaf 3.2.5**: Modern flat theme for Swing applications
- **OkHttp 4.11.0**: HTTP client for API requests
- **Gson 2.10.1**: JSON processing library

### UI Framework
- **Java Swing**: Core UI framework with custom drawn components
- **FlatLaf**: Provides modern flat theme foundation
- **Custom Painting**: All components are custom drawn for consistent appearance

### Map Integration
- **OpenStreetMap API**: Ready for integration (placeholder implemented)
- **Interactive Features**: Pan, zoom, and marker selection
- **Alert Markers**: Pulsing red dots for critical emergencies
- **Marker Types**: Color-coded by severity (Critical, Urgent, Moderate, Low)

## File Structure

```
src/main/java/com/haven/desktop/
├── HavenDashboard.java     # Main application window
├── Main.java              # Application entry point
├── MapPanel.java          # Interactive map component
├── Sidebar.java           # Navigation sidebar component
├── TopBar.java            # Header information bar
├── ui/
│   ├── CustomButton.java  # Custom styled button
│   └── RoundedPanel.java  # Panel with rounded corners
```

## How to Run

### Prerequisites
- Java JDK 17 installed
- Maven for building the project

### Using the Unified Controller Script
The HAVEN desktop application now uses a single unified batch file for all operations:

```bash
# Run the controller script (Windows)
./run.bat

# Run the controller script (Linux/Mac)
./run.sh
```

This will present a menu with the following options:
1. Build the application
2. Run the application
3. Build and run the application
4. Exit

### Environment Setup
Before running the application, you may need to set up the environment variables:

```bash
# Run the environment setup script (Windows - requires admin privileges)
./setup-env.bat
```

This script sets:
- JAVA_HOME to C:\Program Files\Java\jdk-17
- M2_HOME to C:\tools\apache-maven-3.9.11
- Updates PATH to include Java and Maven (permanently)

For Linux/Mac, you can set these variables in your shell profile:
```bash
export JAVA_HOME=/usr/lib/jvm/default-java
export M2_HOME=/opt/maven
export PATH=$JAVA_HOME/bin:$M2_HOME/bin:$PATH
```

### Manual Building
```bash
# Windows
"C:\tools\apache-maven-3.9.11\bin\mvn.cmd" clean package

# Linux/Mac
/opt/maven/bin/mvn clean package
```

### Manual Running
```bash
# Windows
"C:\Program Files\Java\jdk-17\bin\java.exe" -jar target/haven-desktop-1.0.0.jar

# Linux/Mac
java -jar target/haven-desktop-1.0.0.jar
```

## UI Features

### Interactive Map
- **Panning**: Click and drag to move the map
- **Zooming**: Mouse wheel to zoom in/out
- **Alert Markers**: Pulsing red dots for critical emergencies
- **Marker Selection**: Click on markers to select them

### Alert Management
- **Alert List**: Right panel showing latest emergency alerts
- **Color Coding**: Severity-based color coding (red, yellow, blue, green)
- **Search Functionality**: Search through alerts
- **Activate Alert**: Button to create new emergency alerts

### Navigation
- **Sidebar Menu**: Vertical navigation with 8 options
  - Alerts (active by default)
  - History
  - Channels
  - Plans
  - Analytics
  - Assets
  - Users
  - Settings

### Information Display
- **Location**: Current operational area
- **Date/Time**: Real-time updating clock
- **Weather**: Current weather conditions

## Customization

### Color Scheme
Colors can be easily modified by changing the Color objects in the UI components.

### Layout
The BorderLayout structure allows for easy rearrangement of panels.

### Components
All custom components can be extended or modified to add new functionality.

## Future Enhancements

### OpenStreetMap Integration
The MapPanel is designed to integrate with OpenStreetMap API:
1. Implement tile loading from OSM servers
2. Add proper coordinate projection (Mercator)
3. Implement tile caching for performance

### Additional Features
- **Analytics Dashboard**: Charts and graphs for emergency statistics
- **User Management**: Interface for managing registered users
- **History View**: Comprehensive incident history browser
- **Settings Panel**: Configuration options for the application

## Design Principles

### Modern Aesthetics
- **Flat Design**: No 3D effects or gradients
- **Rounded Corners**: All elements feature rounded edges
- **Consistent Spacing**: Uniform padding and margins
- **Typography**: Clean, readable fonts (Segoe UI, Roboto, Inter)

### Usability
- **Intuitive Navigation**: Clear sidebar organization
- **Visual Feedback**: Hover effects and selection states
- **Responsive Layout**: Adapts to different window sizes
- **Accessibility**: High contrast and clear visual hierarchy

### Performance
- **Efficient Rendering**: Custom painting for optimal performance
- **Resource Management**: Proper cleanup of threads and resources
- **Caching**: Tile caching for map performance (planned)

## Troubleshooting

### Common Issues
1. **Java Not Found**: Ensure Java JDK 17 is installed and in PATH
2. **Maven Build Failures**: Check internet connection for dependency downloads
3. **UI Rendering Issues**: Ensure graphics drivers support Java 2D acceleration

### Support
For issues with the implementation, please check:
- Java version compatibility
- Maven dependency resolution
- File permissions for the target directory

## License

This implementation is part of the HAVEN Pet Emergency Response System and is intended for educational and demonstration purposes.