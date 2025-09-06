#!/usr/bin/env node

/**
 * Security Test Suite for LogMacster
 * Run this script to test security configurations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 LogMacster Security Test Suite\n');

// Test 1: Check if nodeIntegration is disabled
console.log('✅ Testing Electron configuration...');
try {
  const electronFile = fs.readFileSync('./public/electron.js', 'utf8');
} catch (err) {
  console.error('❌ Electron configuration not found at ./public/electron.js');
  process.exit(1);
}

const tests = [
  {
    name: 'nodeIntegration disabled',
    test: () => electronFile.includes('nodeIntegration: false'),
    critical: true
  },
  {
    name: 'contextIsolation enabled', 
    test: () => electronFile.includes('contextIsolation: true'),
    critical: true
  },
  {
    name: 'webSecurity enabled',
    test: () => electronFile.includes('webSecurity: true'),
    critical: true
  },
  {
    name: 'Remote module disabled',
    test: () => electronFile.includes('enableRemoteModule: false'),
    critical: true
  }
];

// Test 2: Check preload script validation
console.log('✅ Testing preload script...');
try {
  const preloadFile = fs.readFileSync('./public/preload.js', 'utf8');
} catch (err) {
  console.error('❌ Preload script not found at ./public/preload.js');
  process.exit(1);
}

tests.push(
  {
    name: 'Input validation in preload',
    test: () => preloadFile.includes('typeof callback !== \'function\''),
    critical: true
  },
  {
    name: 'File size validation',
    test: () => preloadFile.includes('10 * 1024 * 1024'),
    critical: true
  },
  {
    name: 'Channel allowlist',
    test: () => preloadFile.includes('allowedChannels'),
    critical: true
  }
);

// Test 3: Check main process security
tests.push(
  {
    name: 'File extension validation',
    test: () => electronFile.includes('allowedExtensions'),
    critical: true
  },
  {
    name: 'Path traversal prevention',
    test: () => electronFile.includes('path.resolve'),
    critical: true
  },
  {
    name: 'Content size limits',
    test: () => electronFile.includes('content.length >'),
    critical: true
  }
);

// Test 4: Check CSP
console.log('✅ Testing Content Security Policy...');
try {
  const htmlFile = fs.readFileSync('./public/index.html', 'utf8');
} catch (err) {
  console.error('❌ HTML file not found at ./public/index.html');
  process.exit(1);
}

tests.push(
  {
    name: 'CSP header present',
    test: () => htmlFile.includes('Content-Security-Policy'),
    critical: true
  },
  {
    name: 'CSP restricts script sources',
    test: () => htmlFile.includes('script-src \'self\''),
    critical: true
  }
);

// Run all tests
let passed = 0;
let failed = 0;
let criticalFailed = 0;

console.log('\n🧪 Running security tests...\n');

tests.forEach((test, index) => {
  try {
    const result = test.test();
    if (result) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      failed++;
      if (test.critical) criticalFailed++;
    }
  } catch (error) {
    console.log(`❌ ${test.name} (Error: ${error.message})`);
    failed++;
    if (test.critical) criticalFailed++;
  }
});

// Summary
console.log(`\n📊 Security Test Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (criticalFailed > 0) {
  console.log(`\n🚨 CRITICAL: ${criticalFailed} critical security tests failed!`);
  console.log('Please fix critical issues before using in production.');
  process.exit(1);
} else if (failed > 0) {
  console.log(`\n⚠️  Some non-critical tests failed. Consider fixing for better security.`);
  process.exit(0);
} else {
  console.log(`\n🎉 All security tests passed! Your application follows Electron security best practices.`);
  process.exit(0);
}
