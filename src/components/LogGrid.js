import React, { useState, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ADIF_FIELDS, validateField } from '../utils/adif';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const LogGrid = ({ data, onDataChange, onDeleteRows }) => {
  const [selectedRows, setSelectedRows] = useState([]);

  // Define column definitions
  const columnDefs = useMemo(() => [
    {
      field: 'CALL',
      headerName: 'Call Sign',
      width: 120,
      editable: true,
      pinned: 'left',
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'QSO_DATE',
      headerName: 'Date',
      width: 110,
      editable: true,
      valueFormatter: (params) => {
        if (params.value && params.value.length === 8) {
          return `${params.value.slice(0, 4)}-${params.value.slice(4, 6)}-${params.value.slice(6, 8)}`;
        }
        return params.value;
      },
      valueParser: (params) => {
        // Remove dashes if user enters date with them
        return params.newValue.replace(/-/g, '');
      }
    },
    {
      field: 'TIME_ON',
      headerName: 'Time On',
      width: 100,
      editable: true,
      valueFormatter: (params) => {
        if (params.value && params.value.length === 6) {
          return `${params.value.slice(0, 2)}:${params.value.slice(2, 4)}:${params.value.slice(4, 6)}`;
        }
        return params.value;
      },
      valueParser: (params) => {
        // Remove colons if user enters time with them
        return params.newValue.replace(/:/g, '');
      }
    },
    {
      field: 'TIME_OFF',
      headerName: 'Time Off',
      width: 100,
      editable: true,
      valueFormatter: (params) => {
        if (params.value && params.value.length === 6) {
          return `${params.value.slice(0, 2)}:${params.value.slice(2, 4)}:${params.value.slice(4, 6)}`;
        }
        return params.value;
      },
      valueParser: (params) => {
        return params.newValue.replace(/:/g, '');
      }
    },
    {
      field: 'BAND',
      headerName: 'Band',
      width: 80,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['160m', '80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '4m', '2m', '1.25m', '70cm', '33cm', '23cm']
      }
    },
    {
      field: 'FREQ',
      headerName: 'Frequency',
      width: 100,
      editable: true,
      type: 'numericColumn'
    },
    {
      field: 'MODE',
      headerName: 'Mode',
      width: 80,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['SSB', 'CW', 'FM', 'AM', 'RTTY', 'PSK31', 'PSK63', 'FT8', 'FT4', 'JS8', 'MFSK', 'OLIVIA', 'JT65', 'JT9', 'MSK144', 'VARA']
      }
    },
    {
      field: 'RST_SENT',
      headerName: 'RST Sent',
      width: 100,
      editable: true
    },
    {
      field: 'RST_RCVD',
      headerName: 'RST Rcvd',
      width: 100,
      editable: true
    },
    {
      field: 'NAME',
      headerName: 'Name',
      width: 120,
      editable: true
    },
    {
      field: 'QTH',
      headerName: 'QTH',
      width: 150,
      editable: true
    },
    {
      field: 'STATE',
      headerName: 'State',
      width: 80,
      editable: true
    },
    {
      field: 'COUNTRY',
      headerName: 'Country',
      width: 120,
      editable: true
    },
    {
      field: 'GRIDSQUARE',
      headerName: 'Grid Square',
      width: 110,
      editable: true,
      valueParser: (params) => {
        return params.newValue.toUpperCase();
      }
    },
    {
      field: 'LAT',
      headerName: 'Latitude',
      width: 120,
      editable: true,
      type: 'numericColumn',
      valueFormatter: (params) => {
        if (params.value !== null && params.value !== undefined && params.value !== '') {
          const lat = parseFloat(params.value);
          if (!isNaN(lat)) {
            return lat.toFixed(6);
          }
        }
        return params.value;
      },
      valueParser: (params) => {
        // Remove degree symbol if present and parse as float
        const cleaned = params.newValue.replace(/°/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? cleaned : parsed;
      },
      cellStyle: (params) => {
        const lat = parseFloat(params.value);
        if (!isNaN(lat) && (lat < -90 || lat > 90)) {
          return { backgroundColor: '#ffebee', color: '#c62828' };
        }
        return null;
      }
    },
    {
      field: 'LON',
      headerName: 'Longitude',
      width: 120,
      editable: true,
      type: 'numericColumn',
      valueFormatter: (params) => {
        if (params.value !== null && params.value !== undefined && params.value !== '') {
          const lon = parseFloat(params.value);
          if (!isNaN(lon)) {
            return lon.toFixed(6) + '°';
          }
        }
        return params.value;
      },
      valueParser: (params) => {
        // Remove degree symbol if present and parse as float
        const cleaned = params.newValue.replace(/°/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? cleaned : parsed;
      },
      cellStyle: (params) => {
        const lon = parseFloat(params.value);
        if (!isNaN(lon) && (lon < -180 || lon > 180)) {
          return { backgroundColor: '#ffebee', color: '#c62828' };
        }
        return null;
      }
    },
    {
      field: 'POWER',
      headerName: 'Power (W)',
      width: 100,
      editable: true,
      type: 'numericColumn'
    },
    {
      field: 'QSL_SENT',
      headerName: 'QSL Sent',
      width: 100,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Y', 'N', 'R', 'Q']
      },
      cellRenderer: (params) => {
        const status = params.value;
        let color = '#666';
        let text = status;
        
        switch (status) {
          case 'Y': color = '#28a745'; text = 'Yes'; break;
          case 'N': color = '#dc3545'; text = 'No'; break;
          case 'R': color = '#007bff'; text = 'Requested'; break;
          case 'Q': color = '#ffc107'; text = 'Queued'; break;
        }
        
        return `<span style="color: ${color}">${text}</span>`;
      }
    },
    {
      field: 'QSL_RCVD',
      headerName: 'QSL Rcvd',
      width: 100,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Y', 'N', 'R', 'Q']
      },
      cellRenderer: (params) => {
        const status = params.value;
        let color = '#666';
        let text = status;
        
        switch (status) {
          case 'Y': color = '#28a745'; text = 'Yes'; break;
          case 'N': color = '#dc3545'; text = 'No'; break;
          case 'R': color = '#007bff'; text = 'Requested'; break;
          case 'Q': color = '#ffc107'; text = 'Queued'; break;
        }
        
        return `<span style="color: ${color}">${text}</span>`;
      }
    },
    {
      field: 'COMMENT',
      headerName: 'Comment',
      width: 200,
      editable: true,
      cellEditorPopup: true,
      cellEditor: 'agLargeTextCellEditor'
    }
  ], []);

  // Grid options
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    cellDataType: false
  }), []);

  // Handle cell value changes
  const onCellValueChanged = useCallback((event) => {
    const { data: rowData, colDef, newValue, oldValue } = event;
    
    // Validate the field
    const validation = validateField(colDef.field, newValue);
    if (!validation.valid) {
      alert(`Invalid ${colDef.headerName}: ${validation.message}`);
      // Revert the change
      event.node.setDataValue(colDef.field, oldValue);
      return;
    }
    
    // Update the data
    const newData = [...data];
    const rowIndex = event.node.rowIndex;
    newData[rowIndex] = { ...rowData };
    onDataChange(newData);
  }, [data, onDataChange]);

  // Handle row selection
  const onSelectionChanged = useCallback((event) => {
    const selectedNodes = event.api.getSelectedNodes();
    setSelectedRows(selectedNodes);
  }, []);

  // Handle delete key
  const onCellKeyDown = useCallback((event) => {
    // Only trigger row deletion if user is NOT editing a cell
    // Check if the cell is being edited by looking at the editing state
    const isEditing = event.api.getEditingCells().length > 0;
    
    if ((event.event.key === 'Delete' || event.event.key === 'Backspace') && !isEditing) {
      if (selectedRows.length > 0) {
        event.event.preventDefault();
        const confirm = window.confirm(`Delete ${selectedRows.length} selected QSO(s)?`);
        if (confirm) {
          onDeleteRows(selectedRows);
          setSelectedRows([]);
        }
      }
    }
  }, [selectedRows, onDeleteRows]);

  return (
    <div className="log-grid-container">
      <div className="grid-toolbar">
        <div className="grid-actions">
          <button 
            onClick={() => {
              if (selectedRows.length > 0) {
                const confirm = window.confirm(`Delete ${selectedRows.length} selected QSO(s)?`);
                if (confirm) {
                  onDeleteRows(selectedRows);
                  setSelectedRows([]);
                }
              }
            }}
            disabled={selectedRows.length === 0}
            className="delete-button"
          >
            Delete Selected ({selectedRows.length})
          </button>
        </div>
        <div className="grid-info">
          <span>Double-click cells to edit • Select rows and press Delete to remove</span>
        </div>
      </div>
      
      <div 
        className="ag-theme-alpine log-grid"
        style={{ height: 'calc(100vh - 180px)', width: '100%' }}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
          onSelectionChanged={onSelectionChanged}
          onCellKeyDown={onCellKeyDown}
          rowSelection="multiple"
          suppressRowClickSelection={false}
          enableRangeSelection={true}
          enableCellTextSelection={true}
          undoRedoCellEditing={true}
          undoRedoCellEditingLimit={20}
          stopEditingWhenCellsLoseFocus={true}
          enterMovesDown={true}
          enterMovesDownAfterEdit={true}
          suppressMovableColumns={false}
          animateRows={true}
        />
      </div>
    </div>
  );
};

export default LogGrid;
