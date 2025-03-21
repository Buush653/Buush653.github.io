#!/bin/bash
set -e

# Ensure the build directory exists
mkdir -p build

# Copy HTML file to build directory and fix paths
cp love-meter/index.html build/
sed -i 's|/src/styles.css|src/styles.css|g' build/index.html
sed -i 's|/src/app.js|src/app.js|g' build/index.html
sed -i 's|type="module" ||g' build/index.html

# Create src directory and copy files
mkdir -p build/src
cp love-meter/src/styles.css build/src/
cp love-meter/src/app.js build/src/

# Create Netlify redirects file
echo "/*    /index.html   200" > build/_redirects

echo "Build completed successfully"
ls -la build
