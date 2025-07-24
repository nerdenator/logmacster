import React from 'react';

const SimpleLogGrid = ({ data, onDataChange, onDeleteRows }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>No QSO data to display</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>QSO Log ({data.length} contacts)</h3>
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        overflow: 'auto',
        maxHeight: '400px'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Call</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Time</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Band</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Mode</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>RST Sent</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>RST Rcvd</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>QTH</th>
            </tr>
          </thead>
          <tbody>
            {data.map((qso, index) => (
              <tr key={index} style={{ 
                backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9',
                ':hover': { backgroundColor: '#e6f3ff' }
              }}>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                  {qso.CALL || ''}
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  {qso.QSO_DATE ? 
                    `${qso.QSO_DATE.slice(0,4)}-${qso.QSO_DATE.slice(4,6)}-${qso.QSO_DATE.slice(6,8)}` 
                    : ''}
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  {qso.TIME_ON ? 
                    `${qso.TIME_ON.slice(0,2)}:${qso.TIME_ON.slice(2,4)}:${qso.TIME_ON.slice(4,6)}` 
                    : ''}
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{qso.BAND || ''}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{qso.MODE || ''}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{qso.RST_SENT || ''}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{qso.RST_RCVD || ''}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{qso.NAME || ''}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{qso.QTH || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        ✨ This is a simplified view. The full ag-Grid will be restored once we confirm everything works.
      </div>
    </div>
  );
};

export default SimpleLogGrid;
