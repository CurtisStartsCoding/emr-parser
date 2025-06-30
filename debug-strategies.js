// Simple debug script to test strategy loading
console.log('🔧 Starting strategy debug...');

// Mock DOM environment
global.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  body: { innerHTML: '' }
};

global.window = {
  location: { hostname: 'test.com' }
};

// Test strategy loading
try {
  console.log('📦 Testing strategy imports...');
  
  // Test if we can require the strategies
  const { EpicStrategy } = require('./src/lib/emr/strategies/epic-strategy.ts');
  console.log('✅ EpicStrategy imported');
  
  const { CernerStrategy } = require('./src/lib/emr/strategies/cerner-strategy.ts');
  console.log('✅ CernerStrategy imported');
  
  const { AthenahealthStrategy } = require('./src/lib/emr/strategies/athenahealth-strategy.ts');
  console.log('✅ AthenahealthStrategy imported');
  
  const { ECWStrategy } = require('./src/lib/emr/strategies/ecw-strategy.ts');
  console.log('✅ ECWStrategy imported');
  
  const { PracticeFusionStrategy } = require('./src/lib/emr/strategies/practicefusion-strategy.ts');
  console.log('✅ PracticeFusionStrategy imported');
  
  const { OncoStrategy } = require('./src/lib/emr/strategies/onco-strategy.ts');
  console.log('✅ OncoStrategy imported');
  
  // Test strategy instantiation
  console.log('🏗️ Testing strategy instantiation...');
  
  const epic = new EpicStrategy();
  console.log('✅ Epic strategy instantiated');
  
  const cerner = new CernerStrategy();
  console.log('✅ Cerner strategy instantiated');
  
  const athena = new AthenahealthStrategy();
  console.log('✅ Athenahealth strategy instantiated');
  
  const ecw = new ECWStrategy();
  console.log('✅ ECW strategy instantiated');
  
  const pf = new PracticeFusionStrategy();
  console.log('✅ Practice Fusion strategy instantiated');
  
  const onco = new OncoStrategy();
  console.log('✅ Oncology strategy instantiated');
  
  // Test detection
  console.log('🔍 Testing detection...');
  
  const epicDetection = epic.detect();
  console.log('Epic detection:', epicDetection);
  
  const cernerDetection = cerner.detect();
  console.log('Cerner detection:', cernerDetection);
  
  console.log('✅ All tests passed!');
  
} catch (error) {
  console.error('❌ Error:', error);
  console.error('Stack:', error.stack);
} 