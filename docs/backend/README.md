# Backend Documentation

This folder contains all documentation related to the HAVEN backend API server.

## Contents

- **MAPLIBRE_INTEGRATION.md** - Documentation on map library integration

## Overview

The HAVEN backend is built with Node.js and Express, serving as the central communication hub between the mobile and desktop applications. Key responsibilities include:

- Receiving emergency alerts from the mobile application
- Forwarding alerts to the desktop application
- Managing user authentication and authorization
- Storing and retrieving emergency alert data
- Providing RESTful APIs for all components

The backend server runs on port 3000 and facilitates real-time communication between the mobile and desktop applications through REST API calls.