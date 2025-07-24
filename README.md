# LogMACster

A native macOS application for amateur radio operators to open, edit, and manage ADIF (Amateur Radio Data Interchange Format) log files in an Excel-like grid interface.

## A Brief Word
I vibecoded this with GitHub CoPilot in agent mode in one night after not being able to find a good GUI app for reading ADIF files on Mac. 

It's written in Electron.JS. I don't know Electron.JS and only know enough about React to be dangerous.

There is absolutely no guarantee that any of this works correctly. If something's broken, well, 🤷🏼‍♂️. File a ticket, make a PR fixing it, fork it into your own project and do a better job, whatever. 

## Features

- **Native macOS Experience**: Built with Electron, featuring native menu bar and file dialogs
- **Excel-like Editing**: Intuitive grid interface powered by ag-Grid for easy QSO data manipulation
- **ADIF Compliance**: Full support for ADIF 3.1.4 specification with field validation
- **File Operations**: Open, edit, and save .adi and .adif files seamlessly
- **Data Validation**: Real-time validation for dates, times, grid squares, and other amateur radio fields
- **Keyboard Shortcuts**: Standard macOS shortcuts for common operations

## Supported ADIF Fields

LogMacster supports all common ADIF fields including:

- **Core QSO Data**: Call sign, date, time, band, frequency, mode, RST reports
- **Station Information**: Grid squares, QTH, state, country information
- **QSL Management**: QSL sent/received status, LoTW, eQSL tracking
- **Contest Data**: Contest exchange information
- **Additional Fields**: Names, comments, power levels, and more

## Installation

### Prerequisites

- macOS 10.14 or later
- Node.js 16 or later (for development)

### Development Setup

1. Clone or download the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. In a new terminal, start the Electron app:
   ```bash
   npm run electron-dev
   ```

### Building for Distribution

To build the application for distribution:

```bash
npm run build
npm run dist:mac
```

This will create a distributable `.dmg` file in the `dist` folder.

## Usage

### Opening Files

- Use **File → Open ADIF File...** (⌘O) to open an existing .adi or .adif file
- The application will parse the file and display all QSO records in the grid

### Editing QSOs

- **Double-click** any cell to edit its value
- Use **Tab** or **Enter** to move between cells
- The grid supports copy/paste operations
- Field validation occurs in real-time

### Adding New QSOs

- Use **File → New Log Entry** (⌘N) to add a new QSO record
- New entries are pre-populated with current date/time

### Saving Files

- **File → Save** (⌘S) to save to the current file
- **File → Save As...** (⌘⇧S) to save to a new location

### Deleting QSOs

- Select one or more rows and press **Delete** or **Backspace**
- Alternatively, use the "Delete Selected" button in the grid toolbar

## Field Validation

LogMacster includes comprehensive validation for ADIF fields:

- **Dates**: Must be in YYYYMMDD format
- **Times**: Must be in HHMMSS format
- **Grid Squares**: Validates Maidenhead locator format
- **Frequencies**: Numeric validation
- **QSL Status**: Limited to valid ADIF enumeration values

## Development

### Project Structure

```
logmacster/
├── public/
│   ├── electron.js      # Main Electron process
│   ├── preload.js       # Secure IPC bridge
│   └── index.html       # HTML template
├── src/
│   ├── components/
│   │   └── LogGrid.js   # ag-Grid data table component
│   ├── utils/
│   │   └── adif.js      # ADIF parsing and generation
│   ├── App.js           # Main React component
│   ├── App.css          # Application styles
│   └── index.js         # React entry point
├── webpack.config.js    # Webpack configuration
└── package.json         # Project configuration
```

### Available Scripts

- `npm start` - Start Webpack dev server
- `npm run build` - Build production React app
- `npm run electron` - Start Electron in production mode
- `npm run electron-dev` - Start Electron in development mode
- `npm run dist` - Build distributable package
- `npm run dist:mac` - Build macOS-specific package

### Technologies Used

- **Electron**: Cross-platform desktop app framework
- **React**: User interface library
- **ag-Grid**: Professional data grid component
- **Webpack**: Module bundler and build tool

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details.

## Amateur Radio Resources

- [ADIF Specification](http://adif.org/) - Official ADIF documentation
- [ARRL](http://www.arrl.org/) - American Radio Relay League
- [Contest Calendar](https://www.contestcalendar.com/) - Amateur radio contest information

## Support

For support or questions, please open an issue on the project repository.
