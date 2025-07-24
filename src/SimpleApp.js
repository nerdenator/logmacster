import React, { useState, useEffect, useCallback } from 'react';
import { parseADIF, generateADIF, getEmptyQSO } from './utils/adif';
import './App.css';

const SimpleApp = () => {
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

      return () => {
        window.electronAPI.removeAllListeners('file-opened');
      };
    }
  }, []);

  const addNewQSO = () => {
    const newQSO = getEmptyQSO();
    setQsoData(prev => [...prev, newQSO]);
    setIsModified(true);
  };

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
            <button onClick={addNewQSO} className="new-qso-button">
              Add First QSO
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            <h3>QSO Data ({qsoData.length} records)</h3>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '400px' }}>
              {JSON.stringify(qsoData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleApp;
