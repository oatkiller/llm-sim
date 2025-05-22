# Simulations Panel Documentation

The simulations panel is a key component of the LLM simulation interface that allows users to manage and interact with multiple simulations. This document outlines its main features and functionality.

## Overview

The simulations panel consists of two main components:
1. `SimList` - Displays and manages the list of simulations
2. `SimulationControls` - Provides controls and detailed view for the active simulation

## SimList Component

The `SimList` component provides a collapsible list of all simulations with the following features:

### Simulation Management
- Each simulation is displayed as a collapsible item
- Users can select a simulation to make it active
- Simulations can be removed from the list
- Active simulation is highlighted with a blue background

### Context Log Management
- Each simulation has its own context log
- Users can view the context log entries with timestamps
- New context entries can be added through a text input
- Existing entries can be removed
- Log entries are displayed in a scrollable container with a maximum height

## SimulationControls Component

The `SimulationControls` component provides detailed control and monitoring of the active simulation:

### Control Buttons
- **Start**: Begins the simulation
- **Pause**: Pauses the running simulation
- **Step**: Executes a single step of the simulation

### Status Information
- Displays current simulation status (idle/running/paused)
- Shows simulation speed
- Indicates if no simulation is active

### Log Display
- Shows a detailed log of simulation events
- Log entries are color-coded by type:
  - Blue: Prompts
  - Green: Responses
  - Gray: System messages
  - Purple: Simulation events
- Each entry includes:
  - Timestamp
  - Entry type
  - Content
  - Optional metadata (displayed in JSON format)

### Current Prompt Display
- Shows the current prompt being processed (if any)
- Displays in a pre-formatted, scrollable container

## State Management

The simulations panel uses Jotai for state management with the following key atoms:
- `simulationStateAtom`: Manages the overall simulation state
- `llmProviderAtom`: Manages the LLM provider configuration

## Error Handling

The system includes error handling for:
- Failed requests to the LLM service
- Invalid simulation states
- Processing errors
- All errors are logged in the context log with appropriate error messages

## UI/UX Features

- Responsive design with appropriate spacing and padding
- Clear visual hierarchy with section headers
- Interactive elements with hover and focus states
- Disabled states for buttons when actions are not available
- Scrollable containers for long content
- Color-coded elements for different types of information 