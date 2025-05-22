# LLM Simulation Application

## Overview
The LLM Simulation application is a React-based tool that allows users to create and manage AI-powered simulations using Language Learning Models (LLMs). The application provides a user-friendly interface for configuring, running, and monitoring simulations.

## Architecture

### Core Components
1. **Main Application (`App.tsx`)**
   - Central component that orchestrates the application
   - Manages state using Jotai atoms
   - Handles communication with the simulation worker

2. **Key Components**
   - `ApiKeyForm`: Manages LLM API key configuration
   - `SettingsForm`: Handles simulation settings
   - `CreateSimForm`: Interface for creating new simulations
   - `SimList`: Displays and manages active simulations
   - `DebugPanel`: Provides debugging information and controls

### State Management
- Uses Jotai for state management
- Key atoms:
  - `simulationStateAtom`: Manages simulation state
  - `llmProviderAtom`: Handles LLM provider configuration

### Worker Architecture
- Simulations run in a separate web worker
- Communication between main thread and worker via message passing
- Supports operations:
  - INIT: Initialize simulation
  - PAUSE: Pause simulation
  - RESUME: Resume simulation
  - STATE_UPDATE: Update simulation state

## Features

### Simulation Management
- Create new simulations
- Configure simulation parameters
- Monitor simulation progress
- Export simulation state and logs

### LLM Integration
- Support for multiple LLM providers
- API key management
- Asynchronous communication with LLM services

### Debugging Tools
- Real-time state monitoring
- Export capabilities for state and logs
- Debug panel for detailed information

## Usage

1. **Setup**
   - Enter your LLM API key
   - Configure simulation settings

2. **Creating Simulations**
   - Use the Create Simulation form
   - Configure simulation parameters
   - Start the simulation

3. **Monitoring**
   - View active simulations in the SimList
   - Monitor progress in real-time
   - Use debug panel for detailed information

4. **Export**
   - Export simulation state as JSON
   - Export simulation logs for analysis

## Technical Stack
- React with TypeScript
- Vite for build tooling
- Jotai for state management
- Tailwind CSS for styling
- Web Workers for simulation processing 