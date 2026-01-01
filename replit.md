# Drone GSD Calculator

## Overview
A web-based Ground Sample Distance (GSD) calculator for drone photography. Helps users determine the optimal flight height or GSD based on their drone and sensor specifications.

## Project Structure
- `index.html` - Main HTML page with modern UI styling
- `style.css` - Additional CSS styles (most styles are inline in index.html)
- `script.js` - Application logic for calculations, unit conversions, and UI interactions
- `drones.json` - Database of drone and sensor specifications

## Features
- Select from various drones and sensors
- Toggle between Imperial (ft, in/px) and Metric (m, cm/px) units
- Calculate GSD from flight height or flight height from desired GSD
- Saves user preferences to local storage
- Modern, responsive UI design

## Running the Project
The project is served as a static website using Python's HTTP server on port 5000.

## Recent Changes
- **UI Modernization**: Updated to a clean, contemporary design with:
  - Subtle gradient background
  - Glass-morphism card effects
  - Modern typography with Inter font
  - Smooth transitions and hover effects
  - Improved input and button styling
  - Better visual hierarchy with section cards
