#!/usr/bin/env node

// Simple validation script
console.log('🔍 Unsplash MCP Server Validation');
console.log('================================');
console.log('');

// Check Node.js version
console.log('✅ Node.js version:', process.version);

// Check if required modules exist
const modules = ['axios', 'cheerio', 'winston', 'dotenv'];
let allModulesFound = true;

modules.forEach(module => {
  try {
    require(module);
    console.log(`✅ ${module} - Found`);
  } catch (error) {
    console.log(`❌ ${module} - Missing`);
    allModulesFound = false;
  }
});

console.log('');

if (allModulesFound) {
  console.log('🎉 All dependencies are correctly installed!');
  console.log('');
  console.log('The Unsplash MCP server is ready to use.');
  console.log('');
  console.log('Available commands:');
  console.log('  npm run build     - Build the TypeScript project');
  console.log('  npm run dev       - Run in development mode');
  console.log('  npm start         - Run in production mode');
  console.log('  npm test          - Run tests');
  console.log('');
  console.log('Available tools in the MCP server:');
  console.log('  • search_images        - Search for images by keywords');
  console.log('  • get_popular_images   - Get trending images');
  console.log('  • browse_category      - Browse by category');
  console.log('  • get_user_profile     - Get photographer info');
  console.log('  • get_image_details    - Detailed image information');
  console.log('  • search_by_color      - Find images by color');
  console.log('  • get_random_photos    - Random high-quality photos');
} else {
  console.log('❌ Some dependencies are missing. Please run: npm install');
}

console.log('');
