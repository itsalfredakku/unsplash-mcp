# Unsplash MCP Setup Guide

This guide will help you set up the Unsplash MCP server for image discovery and scraping.

## Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Internet connection** for accessing Unsplash

## Quick Setup

### Option 1: Automated Setup (Windows)

1. Open Command Prompt or PowerShell in the project directory
2. Run the setup script:
   ```cmd
   setup.bat
   ```

### Option 2: Manual Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` to configure settings (optional):
   ```bash
   USER_AGENT=Your Custom User Agent
   REQUEST_DELAY=1500
   CACHE_TTL=600
   MAX_RETRIES=5
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Test the setup**:
   ```bash
   npm run test:scraper
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Testing

### Run All Tests
```bash
npm test
```

### Test Scraper Functionality
```bash
npm run test:scraper
```

## Configuration Options

### Environment Variables

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `USER_AGENT` | Browser user agent string | Random | Helps avoid detection |
| `REQUEST_DELAY` | Delay between requests (ms) | 1000 | Minimum 500ms recommended |
| `CACHE_TTL` | Cache time-to-live (seconds) | 300 | How long to cache results |
| `MAX_RETRIES` | Maximum retry attempts | 3 | For failed requests |

### Example Configuration

```bash
# .env file
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
REQUEST_DELAY=1500
CACHE_TTL=600
MAX_RETRIES=5
```

## Troubleshooting

### Common Issues

1. **Node.js not found**
   - Install Node.js from [nodejs.org](https://nodejs.org/)
   - Restart your terminal after installation

2. **Permission errors**
   - Run terminal as administrator (Windows)
   - Use `sudo` if needed (Linux/Mac)

3. **Network timeouts**
   - Increase `REQUEST_DELAY` in `.env`
   - Check your internet connection
   - Verify Unsplash is accessible

4. **Scraping errors**
   - Unsplash may have changed their HTML structure
   - Try increasing `REQUEST_DELAY`
   - Check if you're being rate limited

### Debug Mode

Enable debug logging by setting the log level:
```bash
# In your environment or before running
export LOG_LEVEL=debug
npm run dev
```

### Testing Connection

Test if the scraper can reach Unsplash:
```bash
npm run test:scraper
```

This will attempt to:
- Search for images
- Get popular images
- Browse categories
- Get random photos

## Performance Tips

1. **Adjust request delay**: Higher values are more respectful but slower
2. **Use caching**: The built-in cache reduces redundant requests
3. **Limit results**: Use smaller `perPage` values for faster responses
4. **Monitor logs**: Check for rate limiting or errors

## Integration with MCP Clients

Once running, the server can be used with MCP-compatible clients:

### Claude Desktop Configuration

Add to your Claude Desktop config:
```json
{
  "mcpServers": {
    "unsplash-mcp": {
      "command": "node",
      "args": ["path/to/unsplash-mcp/dist/index.js"]
    }
  }
}
```

### GitHub Copilot Integration

The server follows MCP standards and should work with any MCP-compatible client.

## Available Tools

After setup, you'll have access to these tools:

- `search_images` - Search for images by keywords
- `get_popular_images` - Get trending images
- `browse_category` - Browse by category
- `get_user_profile` - Get photographer info
- `get_image_details` - Detailed image information
- `search_by_color` - Find images by color
- `get_random_photos` - Random high-quality photos

## Maintenance

### Regular Tasks

1. **Update dependencies**:
   ```bash
   npm update
   ```

2. **Clear cache** (if needed):
   ```bash
   # The cache clears automatically, but you can restart the server
   npm run dev
   ```

3. **Check logs** for any issues or rate limiting

### Updating

To update the server:
1. Pull latest changes
2. Run `npm install` to update dependencies
3. Run `npm run build` to rebuild
4. Restart the server

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure your configuration is correct
4. Test with minimal settings first

## Legal Notice

This tool respects Unsplash's robots.txt and implements rate limiting. Use responsibly and in accordance with Unsplash's terms of service.
