#!/usr/bin/env node

console.log('🧪 Running Unsplash MCP Tests...');
console.log('================================');

// Test the basic imports
try {
  console.log('✅ Testing basic imports...');
  
  // Test if we can import the main modules without errors
  const { toolDefinitions } = require('./dist/tools.js');
  console.log(`✅ Tool definitions loaded: ${toolDefinitions.length} tools`);
  
  console.log('✅ Testing tool definitions...');
  toolDefinitions.forEach(tool => {
    if (!tool.name) throw new Error(`Tool missing name: ${JSON.stringify(tool)}`);
    if (!tool.description) throw new Error(`Tool missing description: ${tool.name}`);
    if (!tool.inputSchema) throw new Error(`Tool missing schema: ${tool.name}`);
    console.log(`   ✓ ${tool.name} - OK`);
  });
  
  console.log('✅ Testing configuration...');
  const { config } = require('./dist/config.js');
  console.log(`   ✓ User Agent: ${config.userAgent.substring(0, 50)}...`);
  console.log(`   ✓ Request Delay: ${config.requestDelay}ms`);
  console.log(`   ✓ Cache TTL: ${config.cacheTtl}s`);
  console.log(`   ✓ Max Retries: ${config.maxRetries}`);
  
  console.log('✅ Testing logger...');
  const { logger } = require('./dist/logger.js');
  logger.info('Test log message');
  console.log('   ✓ Logger working');
  
  console.log('✅ Testing cache...');
  const { SimpleCache } = require('./dist/cache.js');
  const cache = new SimpleCache(60);
  cache.set('test', 'value');
  const retrieved = cache.get('test');
  if (retrieved !== 'value') throw new Error('Cache not working');
  console.log('   ✓ Cache working');
  
  console.log('');
  console.log('🎉 ALL TESTS PASSED!');
  console.log('');
  console.log('Available tools:');
  toolDefinitions.forEach(tool => {
    console.log(`   • ${tool.name} - ${tool.description.substring(0, 60)}...`);
  });
  console.log('');
  console.log('✅ The Unsplash MCP server is ready to run!');
  console.log('   Run: npm start (or npm run dev for development)');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
