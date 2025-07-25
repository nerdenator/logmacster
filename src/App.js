import React, { useState, useEffect, useCallback } from 'react';
import LogGrid from './components/LogGrid';
import { parseADIF, generateADIF, getEmptyQSO } from './utils/adif';
import './App.css';

const App = () => {
  const [qsoData, setQsoData] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [header, setHeader] = useState('');

  // Handle file operations from Electron menu
  useEffect(() => {
    if (window.electronAPI) {
      // Handle file opened
      window.electronAPI.onFileOpened((event, { filePath, content }) => {
        try {
          const parsed = parseADIF(content);
          setQsoData(parsed.records);
          setHeader(parsed.header);
          setCurrentFile(filePath);
          setIsModified(false);
          console.log(`Loaded ${parsed.records.length} QSOs from ${filePath}`);
        } catch (error) {
          console.error('Error parsing ADIF file:', error);
          alert('Error parsing ADIF file: ' + error.message);
        }
      });

      // Handle save file
      window.electronAPI.onSaveFile((event) => {
        if (currentFile) {
          saveFile(currentFile);
        } else {
          // Trigger save as dialog
          window.electronAPI.onSaveFileAs((event, filePath) => {
            saveFile(filePath);
          });
        }
      });

      // Handle save file as
      window.electronAPI.onSaveFileAs((event, filePath) => {
        saveFile(filePath);
      });

      // Handle new entry
      window.electronAPI.onNewEntry((event) => {
        addNewQSO();
      });

      return () => {
        window.electronAPI.removeAllListeners('file-opened');
        window.electronAPI.removeAllListeners('save-file');
        window.electronAPI.removeAllListeners('save-file-as');
        window.electronAPI.removeAllListeners('new-entry');
      };
    }
  }, [currentFile, qsoData, header]);

  const saveFile = async (filePath) => {
    try {
      const content = generateADIF(qsoData, header);
      const result = await window.electronAPI.saveFile(filePath, content);
      
      if (result.success) {
        setCurrentFile(filePath);
        setIsModified(false);
        console.log(`Saved to ${filePath}`);
      } else {
        alert('Error saving file: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file: ' + error.message);
    }
  };

  const addNewQSO = () => {
    const newQSO = getEmptyQSO();
    setQsoData(prev => [...prev, newQSO]);
    setIsModified(true);
  };

  const openFile = async () => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.openFile();
        
        if (result.success && !result.canceled) {
          const parsed = parseADIF(result.content);
          setQsoData(parsed.records);
          setHeader(parsed.header);
          setCurrentFile(result.filePath);
          setIsModified(false);
          console.log(`Loaded ${parsed.records.length} QSOs from ${result.filePath}`);
        }
      } catch (error) {
        console.error('Error opening ADIF file:', error);
        alert('Error opening ADIF file: ' + error.message);
      }
    }
  };

  const handleDataChange = useCallback((newData) => {
    setQsoData(newData);
    setIsModified(true);
  }, []);

  const handleDeleteRows = useCallback((selectedRows) => {
    // Get the actual data objects from the selected rows
    const selectedData = selectedRows.map(row => row.data);
    console.log('Deleting rows with data:', selectedData);
    
    // Filter out the selected data objects from the qsoData array
    setQsoData(prev => {
      const newData = prev.filter(qso => {
        // Check if this QSO is in the selected data
        return !selectedData.some(selectedQso => {
          // Compare QSOs by their key fields to identify them uniquely
          return selectedQso.CALL === qso.CALL && 
                 selectedQso.QSO_DATE === qso.QSO_DATE && 
                 selectedQso.TIME_ON === qso.TIME_ON;
        });
      });
      console.log('Data after deletion:', newData);
      return newData;
    });
    setIsModified(true);
  }, []);

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-title">
          <h1>LogMacster</h1>
          <span className="file-info">
            {currentFile ? (
              <>
                {currentFile.split('/').pop()}
                {isModified && ' *'}
              </>
            ) : (
              'No file loaded'
            )}
          </span>
        </div>
        <div className="app-stats">
          <span className="qso-count">{qsoData.length} QSOs</span>
        </div>
      </div>
      
      <div className="app-content">
        {qsoData.length === 0 ? (
          <div className="empty-state">
            <h2>Welcome to LogMacster</h2>
            <p>Open an ADIF file from the File menu to get started, or create a new log entry.</p>
            <div className="welcome-buttons">
              <button onClick={openFile} className="open-file-button">
                Open ADIF File
              </button>
              <button onClick={addNewQSO} className="new-qso-button">
                Add First QSO
              </button>
            </div>
          </div>
        ) : (
          <LogGrid 
            data={qsoData} 
            onDataChange={handleDataChange}
            onDeleteRows={handleDeleteRows}
          />
        )}
      </div>
    </div>
  );
};

export default App;
