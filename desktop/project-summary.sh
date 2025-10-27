#!/bin/bash
# HAVEN Desktop Project Summary Script

echo "=== HAVEN Desktop Application Summary ==="
echo ""

echo "Project Structure:"
echo "------------------"
find . -type f -not -path "*/target/*" -not -path "*/\.git/*" -not -path "*/node_modules/*" | sed 's/[^/]*\//├── /g' | sed 's/├── /│   /g' | sed 's/│   \([^│]\)/├── \1/' | sed 's/├── $/└── /' | head -n -1

echo ""
echo "Build Status:"
echo "-------------"
if [ -f "target/haven-desktop-1.0-SNAPSHOT.jar" ]; then
    echo "✅ JAR file successfully created"
    echo "   Size: $(du -h target/haven-desktop-1.0-SNAPSHOT.jar | cut -f1)"
else
    echo "❌ JAR file not found"
fi

echo ""
echo "Java Source Files:"
echo "------------------"
ls -la src/main/java/com/haven/

echo ""
echo "Resources:"
echo "----------"
ls -la src/main/resources/

echo ""
echo "=== Summary Complete ==="