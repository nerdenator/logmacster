<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# LogMacster - ADIF Log Editor

This is an Electron application for macOS that allows amateur radio operators to open, edit, and save ADIF (Amateur Radio Data Interchange Format) files in an Excel-like grid interface.

## Project Structure

- **Main Process**: `public/electron.js` - Handles the main Electron process, menus, file operations
- **Preload Script**: `public/preload.js` - Secure bridge between main and renderer processes
- **React App**: `src/` - The user interface built with React and ag-Grid
  - `App.js` - Main application component
  - `components/LogGrid.js` - Excel-like grid for editing QSO data
  - `utils/adif.js` - ADIF file parsing and generation utilities

## Key Features

- Open and parse ADIF files (.adi, .adif)
- Excel-like grid editing with validation
- macOS native menu bar integration
- Save/Save As functionality
- Field validation for ADIF compliance
- Support for common amateur radio fields

## Development Guidelines

- Use React functional components with hooks
- Follow ADIF 3.1.4 specification for field validation
- Maintain separation between main and renderer processes
- Use ag-Grid for data table functionality
- Implement proper error handling for file operations
