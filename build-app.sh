#!/bin/bash

# NoteBot AI App Builder Script
# This script helps you build NoteBot AI for different platforms

echo "🤖 NoteBot AI App Builder"
echo "=========================="
echo ""

# Function to build PWA
build_pwa() {
    echo "📱 Building Progressive Web App (PWA)..."
    npm run build
    echo "✅ PWA build complete!"
    echo "📂 Files are in: dist/public/"
    echo "🌐 Deploy these files to any web server"
    echo "📲 Users can install as an app from their browser"
    echo ""
}

# Function to build Electron app (requires dependencies)
build_electron() {
    echo "🖥️ Building Electron Desktop App..."
    
    # Check if electron dependencies are installed
    if ! npm list electron >/dev/null 2>&1; then
        echo "⚠️  Electron dependencies not installed."
        echo "Run: npm install --save-dev electron electron-builder concurrently wait-on"
        echo "Then try again."
        return 1
    fi
    
    echo "Building for desktop platforms..."
    npm run electron:dist
    echo "✅ Electron build complete!"
    echo "📂 Desktop apps are in: dist-electron/"
    echo ""
}

# Function to create mobile build instructions
mobile_instructions() {
    echo "📱 Mobile App Options:"
    echo "====================="
    echo ""
    echo "Option 1: Progressive Web App (Recommended)"
    echo "- Build with: ./build-app.sh pwa"
    echo "- Users install from browser"
    echo "- Works on iOS, Android, Desktop"
    echo "- No app store needed"
    echo ""
    echo "Option 2: Capacitor (Native Mobile App)"
    echo "- Install: npm install @capacitor/core @capacitor/cli"
    echo "- Init: npx cap init"
    echo "- Add platforms: npx cap add ios && npx cap add android"
    echo "- Build: npm run build && npx cap sync"
    echo "- Open: npx cap open ios / npx cap open android"
    echo ""
    echo "Option 3: Expo (React Native)"
    echo "- Requires rewriting components for React Native"
    echo "- Most complex but most native-like experience"
    echo ""
}

# Function to show deployment options
deployment_options() {
    echo "🚀 Deployment Options:"
    echo "====================="
    echo ""
    echo "Web/PWA Deployment:"
    echo "- Vercel: vercel --prod"
    echo "- Netlify: netlify deploy --prod"
    echo "- Firebase: firebase deploy"
    echo "- GitHub Pages: gh-pages -d dist/public"
    echo ""
    echo "Desktop Distribution:"
    echo "- Direct download: Share the installer files"
    echo "- Microsoft Store: Package as MSIX"
    echo "- Mac App Store: Code sign and submit"
    echo "- Snap Store: Create snap package"
    echo ""
}

# Main menu
case "$1" in
    "pwa")
        build_pwa
        ;;
    "electron")
        build_electron
        ;;
    "mobile")
        mobile_instructions
        ;;
    "deploy")
        deployment_options
        ;;
    *)
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  pwa        Build Progressive Web App (works everywhere)"
        echo "  electron   Build Desktop App (Windows, Mac, Linux)"
        echo "  mobile     Show mobile app building options"
        echo "  deploy     Show deployment options"
        echo ""
        echo "Quick Start:"
        echo "  $0 pwa      # Build installable web app"
        echo ""
        echo "Examples:"
        echo "  $0 pwa && echo 'Ready to deploy!'"
        echo "  $0 electron  # Build desktop app"
        echo ""
        ;;
esac
