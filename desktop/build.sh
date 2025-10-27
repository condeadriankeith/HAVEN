#!/bin/bash
echo "Building HAVEN Desktop Application..."
cd "$(dirname "$0")"
mvn clean compile
echo "Build completed."