import { UnsplashScraper } from './unsplash-scraper.js';
import { logger } from './logger.js';

async function testScraper() {
  console.log('🔍 Testing Unsplash Scraper...\n');
  
  const scraper = new UnsplashScraper();
  
  try {
    // Test 1: Search for nature images
    console.log('📸 Test 1: Searching for "nature" images...');
    const searchResults = await scraper.searchImages({
      query: 'nature',
      page: 1,
      perPage: 5,
    });
    console.log(`✅ Found ${searchResults.length} nature images`);
    if (searchResults.length > 0) {
      console.log(`   First result: ${searchResults[0].altDescription || 'No description'}`);
    }
    console.log('');

    // Test 2: Get popular images
    console.log('🔥 Test 2: Getting popular images...');
    const popularImages = await scraper.getPopularImages(1, 3);
    console.log(`✅ Found ${popularImages.length} popular images`);
    console.log('');

    // Test 3: Browse category
    console.log('🎨 Test 3: Browsing photography category...');
    const categoryImages = await scraper.browseCategory('photography', 1, 3);
    console.log(`✅ Found ${categoryImages.length} photography images`);
    console.log('');

    // Test 4: Get random photos
    console.log('🎲 Test 4: Getting random photos...');
    const randomPhotos = await scraper.getRandomPhotos(3);
    console.log(`✅ Found ${randomPhotos.length} random photos`);
    console.log('');

    // Cache information
    console.log(`📦 Cache size: ${scraper.getCacheSize()} items`);
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    logger.error('Test failed', { error });
  }
}

// Run the test
testScraper().catch(console.error);
