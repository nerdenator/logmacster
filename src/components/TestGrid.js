import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const TestGrid = ({ data }) => {
  console.log('TestGrid received data:', data);

  const columnDefs = [
    { field: 'CALL', headerName: 'Call Sign', width: 120 },
    { field: 'QSO_DATE', headerName: 'Date', width: 110 },
    { field: 'TIME_ON', headerName: 'Time On', width: 100 },
    { field: 'BAND', headerName: 'Band', width: 80 },
    { field: 'MODE', headerName: 'Mode', width: 80 }
  ];

  return (
    <div className="test-grid-container" style={{ padding: '20px' }}>
      <h3>Test Grid - {data.length} rows</h3>
      <div 
        className="ag-theme-alpine"
        style={{ height: '400px', width: '100%' }}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true
          }}
        />
      </div>
    </div>
  );
};

export default TestGrid;
