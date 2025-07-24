/**
 * ADIF (Amateur Data Interchange Format) Parser and Generator
 * Supports ADIF version 3.1.4 specification
 */

// Common ADIF field definitions with their types and descriptions
export const ADIF_FIELDS = {
  // Core QSO fields
  'CALL': { type: 'S', description: 'Contacted station callsign' },
  'QSO_DATE': { type: 'D', description: 'QSO date (YYYYMMDD)' },
  'TIME_ON': { type: 'T', description: 'QSO start time (HHMMSS)' },
  'TIME_OFF': { type: 'T', description: 'QSO end time (HHMMSS)' },
  'BAND': { type: 'E', description: 'QSO band' },
  'FREQ': { type: 'N', description: 'QSO frequency in MHz' },
  'MODE': { type: 'E', description: 'QSO mode' },
  'SUBMODE': { type: 'E', description: 'QSO submode' },
  'RST_SENT': { type: 'S', description: 'Signal report sent' },
  'RST_RCVD': { type: 'S', description: 'Signal report received' },
  
  // Station information
  'STATION_CALLSIGN': { type: 'S', description: 'Logging station callsign' },
  'MY_GRIDSQUARE': { type: 'G', description: 'Logging station gridsquare' },
  'GRIDSQUARE': { type: 'G', description: 'Contacted station gridsquare' },
  'MY_CITY': { type: 'S', description: 'Logging station city' },
  'MY_STATE': { type: 'E', description: 'Logging station state' },
  'MY_COUNTRY': { type: 'E', description: 'Logging station country' },
  'QTH': { type: 'S', description: 'Contacted station city' },
  'STATE': { type: 'E', description: 'Contacted station state' },
  'COUNTRY': { type: 'E', description: 'Contacted station country' },
  'DXCC': { type: 'N', description: 'DXCC entity code' },
  
  // Contest and awards
  'CONTEST_ID': { type: 'S', description: 'Contest identifier' },
  'STX': { type: 'N', description: 'Contest exchange sent' },
  'SRX': { type: 'N', description: 'Contest exchange received' },
  'STX_STRING': { type: 'S', description: 'Contest exchange sent (string)' },
  'SRX_STRING': { type: 'S', description: 'Contest exchange received (string)' },
  
  // QSL and confirmation
  'QSL_SENT': { type: 'E', description: 'QSL sent status' },
  'QSL_RCVD': { type: 'E', description: 'QSL received status' },
  'QSL_SENT_VIA': { type: 'E', description: 'QSL sent via' },
  'QSL_RCVD_VIA': { type: 'E', description: 'QSL received via' },
  'QSLMSG': { type: 'M', description: 'QSL message' },
  'LOTW_QSL_SENT': { type: 'E', description: 'LoTW QSL sent status' },
  'LOTW_QSL_RCVD': { type: 'E', description: 'LoTW QSL received status' },
  'EQSL_QSL_SENT': { type: 'E', description: 'eQSL sent status' },
  'EQSL_QSL_RCVD': { type: 'E', description: 'eQSL received status' },
  
  // Additional fields
  'NAME': { type: 'S', description: 'Contacted operator name' },
  'EMAIL': { type: 'S', description: 'Contacted operator email' },
  'COMMENT': { type: 'S', description: 'QSO comment' },
  'NOTES': { type: 'M', description: 'QSO notes' },
  'POWER': { type: 'N', description: 'Power in watts' },
  'OPERATOR': { type: 'S', description: 'Logging operator callsign' },
  'OWNER_CALLSIGN': { type: 'S', description: 'Owner callsign' }
};

/**
 * Parse ADIF content and return an array of QSO records
 */
export function parseADIF(content) {
  const records = [];
  let header = '';
  
  // Remove BOM if present
  content = content.replace(/^\uFEFF/, '');
  
  // Find header section
  const headerMatch = content.match(/<EOH>/i);
  if (headerMatch) {
    header = content.substring(0, headerMatch.index + 5);
    content = content.substring(headerMatch.index + 5);
  }
  
  // Split by <EOR> tags to get individual records
  const recordStrings = content.split(/<EOR>/i);
  
  for (let recordString of recordStrings) {
    recordString = recordString.trim();
    if (!recordString) continue;
    
    const record = {};
    
    // Parse field tags
    const fieldRegex = /<([^:>]+)(?::(\d+))?(?::([^>]+))?>/gi;
    let match;
    let lastIndex = 0;
    
    while ((match = fieldRegex.exec(recordString)) !== null) {
      const fieldName = match[1].toUpperCase();
      const length = parseInt(match[2]) || 0;
      const dataType = match[3];
      
      // Get field value
      const valueStart = fieldRegex.lastIndex;
      let value = '';
      
      if (length > 0) {
        // Use the specified length
        value = recordString.substring(valueStart, valueStart + length);
        fieldRegex.lastIndex = valueStart + length;
      } else {
        // If no length specified, find next tag or end of record
        const nextTagIndex = recordString.indexOf('<', valueStart);
        if (nextTagIndex === -1) {
          value = recordString.substring(valueStart).trim();
          fieldRegex.lastIndex = recordString.length;
        } else {
          value = recordString.substring(valueStart, nextTagIndex).trim();
          fieldRegex.lastIndex = nextTagIndex;
        }
      }
      
      // Only add non-empty values
      if (value) {
        record[fieldName] = value;
      }
      lastIndex = fieldRegex.lastIndex;
    }
    
    if (Object.keys(record).length > 0) {
      records.push(record);
    }
  }
  
  return { header, records };
}

/**
 * Generate ADIF content from an array of QSO records
 */
export function generateADIF(records, header = '') {
  let adif = '';
  
  // Add header if provided
  if (header) {
    adif += header;
    if (!header.includes('<EOH>')) {
      adif += '<EOH>\n';
    }
  } else {
    adif += 'Generated by LogMacster\n<EOH>\n';
  }
  
  // Add records
  for (const record of records) {
    for (const [fieldName, value] of Object.entries(record)) {
      if (value !== undefined && value !== '') {
        const cleanValue = String(value).trim();
        if (cleanValue) {
          adif += `<${fieldName.toUpperCase()}:${cleanValue.length}>${cleanValue}`;
        }
      }
    }
    adif += '<EOR>\n';
  }
  
  return adif;
}

/**
 * Get a default empty QSO record with common fields
 */
export function getEmptyQSO() {
  const now = new Date();
  const qsoDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const qsoTime = now.toISOString().slice(11, 19).replace(/:/g, '');
  
  return {
    CALL: '',
    QSO_DATE: qsoDate,
    TIME_ON: qsoTime,
    TIME_OFF: '',
    BAND: '',
    FREQ: '',
    MODE: '',
    RST_SENT: '59',
    RST_RCVD: '59',
    NAME: '',
    QTH: '',
    GRIDSQUARE: '',
    COMMENT: '',
    QSL_SENT: 'N',
    QSL_RCVD: 'N'
  };
}

/**
 * Validate ADIF field value
 */
export function validateField(fieldName, value) {
  const field = ADIF_FIELDS[fieldName.toUpperCase()];
  if (!field) return { valid: true, message: '' };
  
  const errors = [];
  
  switch (field.type) {
    case 'D': // Date (YYYYMMDD)
      if (value && !/^\d{8}$/.test(value)) {
        errors.push('Date must be in YYYYMMDD format');
      }
      break;
    case 'T': // Time (HHMMSS)
      if (value && !/^\d{6}$/.test(value)) {
        errors.push('Time must be in HHMMSS format');
      }
      break;
    case 'N': // Number
      if (value && isNaN(Number(value))) {
        errors.push('Must be a valid number');
      }
      break;
    case 'G': // Grid square
      if (value && !/^[A-R]{2}[0-9]{2}([A-X]{2})?$/i.test(value)) {
        errors.push('Invalid grid square format');
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    message: errors.join(', ')
  };
}
