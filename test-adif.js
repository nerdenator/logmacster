// Quick test of ADIF parser
const { parseADIF } = require('./src/utils/adif.js');
const fs = require('fs');

try {
  const content = fs.readFileSync('./sample.adi', 'utf8');
  console.log('File content length:', content.length);
  console.log('First 200 chars:', content.substring(0, 200));
  
  const parsed = parseADIF(content);
  console.log('Parsed header:', parsed.header);
  console.log('Number of records:', parsed.records.length);
  console.log('First record:', parsed.records[0]);
} catch (error) {
  console.error('Error:', error);
}
