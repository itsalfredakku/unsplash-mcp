# Unsplash MCP Server

An MCP (Model Context Protocol) server that provides Unsplash image discovery capabilities using web scraping, enabling AI agents like GitHub Copilot to search and retrieve high-quality images.

## Features

- 🔍 **Search Images**: Find images by keywords, themes, and categories
- 📸 **Image Discovery**: Discover trending and popular images
- 🎨 **Category Browsing**: Browse images by specific categories
- 👤 **User Profiles**: Get photographer information and portfolios
- 📊 **Image Details**: Retrieve comprehensive image metadata
- 🔄 **Smart Caching**: Improved performance with intelligent caching
- 🌐 **Web Scraping**: No API key required - uses web scraping
- 📋 **Comprehensive Logging**: Detailed logs for monitoring and debugging
- 🎯 **Color Filtering**: Search images by dominant colors
- 📏 **Resolution Filtering**: Filter by image dimensions and quality

## Quick Start

1. **Clone and install**:
```bash
git clone https://github.com/yourusername/unsplash-mcp.git
cd unsplash-mcp
npm install
```

2. **Build and run**:
```bash
npm run build
npm start
```

3. **Test the scraper**:
```bash
npm run test:scraper
```

## Available Tools

### 🔍 Search Images
Search for images using keywords and filters.

**Parameters:**
- `query` (required): Search keywords
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Results per page (default: 20)
- `orientation` (optional): Portrait, landscape, or squarish
- `color` (optional): Filter by color

### 📸 Get Popular Images
Retrieve trending and popular images.

**Parameters:**
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Results per page (default: 20)

### 🎨 Browse Categories
Browse images by specific categories.

**Parameters:**
- `category` (required): Category name
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Results per page (default: 20)

### 👤 Get User Profile
Get photographer information and their portfolio.

**Parameters:**
- `username` (required): Unsplash username

### 📊 Get Image Details
Get comprehensive information about a specific image.

**Parameters:**
- `imageId` (required): Unsplash image ID

### 🎯 Search by Color
Find images with specific dominant colors.

**Parameters:**
- `color` (required): Color name or hex code
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Results per page (default: 20)

## Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `USER_AGENT` | ❌ | Custom user agent string | Random |
| `REQUEST_DELAY` | ❌ | Delay between requests (ms) | 1000 |
| `CACHE_TTL` | ❌ | Cache time-to-live (seconds) | 300 |
| `MAX_RETRIES` | ❌ | Maximum retry attempts | 3 |

### Example Configuration

Create a `.env` file:
```bash
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
REQUEST_DELAY=1500
CACHE_TTL=600
MAX_RETRIES=5
```

## Usage Examples

### Search for Nature Images
```javascript
{
  "tool": "search_images",
  "arguments": {
    "query": "mountain landscape",
    "orientation": "landscape",
    "color": "blue"
  }
}
```

### Get Popular Images
```javascript
{
  "tool": "get_popular_images",
  "arguments": {
    "page": 1,
    "perPage": 10
  }
}
```

### Browse Photography Category
```javascript
{
  "tool": "browse_category",
  "arguments": {
    "category": "photography",
    "page": 1
  }
}
```

## Image Data Structure

Each image returned includes:
- **ID**: Unique image identifier
- **URLs**: Various resolution URLs (thumb, small, regular, full)
- **Dimensions**: Width and height
- **Description**: Image description/alt text
- **Photographer**: Creator information
- **Colors**: Dominant color palette
- **Downloads**: Download count
- **Likes**: Like count
- **Tags**: Associated keywords

## Development

### Scripts

- `npm run dev`: Run in development mode
- `npm run build`: Build for production
- `npm run test`: Run tests
- `npm run test:scraper`: Test scraping functionality
- `npm run lint`: Lint code
- `npm run format`: Format code

### Testing

The server includes comprehensive testing:
```bash
npm test
```

Test specific scraper functionality:
```bash
npm run test:scraper
```

## Technical Details

### Web Scraping Approach
- Uses Cheerio for HTML parsing
- Implements rate limiting and retries
- Rotates user agents to avoid detection
- Respects robots.txt and rate limits

### Caching Strategy
- In-memory caching for frequently accessed data
- Configurable TTL for different data types
- Smart cache invalidation

### Error Handling
- Comprehensive error catching and logging
- Graceful fallbacks for failed requests
- Detailed error messages for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This tool is for educational and personal use. Please respect Unsplash's terms of service and rate limits. The scraping functionality is designed to be respectful and non-intrusive.
