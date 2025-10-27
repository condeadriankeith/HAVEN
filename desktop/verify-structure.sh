#!/bin/bash
# HAVEN Desktop Application Verification Script

echo "=== HAVEN Desktop Application Verification ==="
echo ""

# Check if Java is installed
echo "Checking Java installation..."
java -version
if [ $? -ne 0 ]; then
    echo "ERROR: Java is not installed or not in PATH"
    exit 1
fi

# Check if Maven is installed
echo ""
echo "Checking Maven installation..."
mvn -version
if [ $? -ne 0 ]; then
    echo "ERROR: Maven is not installed or not in PATH"
    exit 1
fi

# Check project structure
echo ""
echo "Checking project structure..."
if [ ! -d "src/main/java/com/haven" ]; then
    echo "ERROR: Java source directory not found"
    exit 1
fi

if [ ! -f "pom.xml" ]; then
    echo "ERROR: pom.xml not found"
    exit 1
fi

# List Java source files
echo ""
echo "Java source files:"
ls -la src/main/java/com/haven/

# Check if required classes exist
echo ""
echo "Checking required Java classes..."
REQUIRED_CLASSES=("Main.java" "HavenDashboard.java" "CustomButton.java" "RoundedPanel.java" "MapPanel.java" "AlertPanel.java")
for class in "${REQUIRED_CLASSES[@]}"; do
    if [ ! -f "src/main/java/com/haven/$class" ]; then
        echo "ERROR: Required class $class not found"
        exit 1
    else
        echo "  ✓ $class found"
    fi
done

# Compile the project
echo ""
echo "Compiling the project..."
mvn clean compile
if [ $? -ne 0 ]; then
    echo "ERROR: Compilation failed"
    exit 1
else
    echo "  ✓ Compilation successful"
fi

# Package the project
echo ""
echo "Packaging the project..."
mvn package
if [ $? -ne 0 ]; then
    echo "ERROR: Packaging failed"
    exit 1
else
    echo "  ✓ Packaging successful"
fi

# Check if JAR file was created
echo ""
echo "Checking JAR file..."
if [ ! -f "target/haven-desktop-1.0-SNAPSHOT.jar" ]; then
    echo "ERROR: JAR file not created"
    exit 1
else
    echo "  ✓ JAR file created successfully"
    echo "  JAR size: $(du -h target/haven-desktop-1.0-SNAPSHOT.jar | cut -f1)"
fi

echo ""
echo "=== Verification Complete ==="
echo "The HAVEN desktop application is ready to run!"
echo ""
echo "To run the application, use one of the following commands:"
echo "  mvn javafx:run"
echo "  java -jar target/haven-desktop-1.0-SNAPSHOT.jar (after adding JavaFX modules)"