#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { UnsplashScraper } from './unsplash-scraper.js';
import { toolDefinitions } from './tools.js';
import { logger, logError } from './logger.js';
import { config, validateConfig } from './config.js';

class UnsplashMCPServer {
  private server: Server;
  private scraper: UnsplashScraper;

  constructor() {
    this.server = new Server(
      {
        name: 'unsplash-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.scraper = new UnsplashScraper();
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error: any) => {
      logError(error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: toolDefinitions,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'search_images':
            return await this.handleSearchImages(args);
          
          case 'get_popular_images':
            return await this.handleGetPopularImages(args);
          
          case 'browse_category':
            return await this.handleBrowseCategory(args);
          
          case 'get_user_profile':
            return await this.handleGetUserProfile(args);
          
          case 'get_image_details':
            return await this.handleGetImageDetails(args);
          
          case 'search_by_color':
            return await this.handleSearchByColor(args);
          
          case 'get_collections':
            return await this.handleGetCollections(args);
          
          case 'get_collection_photos':
            return await this.handleGetCollectionPhotos(args);
          
          case 'get_random_photos':
            return await this.handleGetRandomPhotos(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        logError(error as Error);
        
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private async handleSearchImages(args: any) {
    const { query, page = 1, perPage = 20, orientation, color } = args;
    
    if (!query) {
      throw new McpError(ErrorCode.InvalidParams, 'Query parameter is required');
    }

    const images = await this.scraper.searchImages({
      query,
      page,
      perPage,
      orientation,
      color,
    });

    return {
      content: [
        {
          type: 'text',
          text: `# Search Results for "${query}"\n\n${JSON.stringify(images, null, 2)}`
        }
      ]
    };
  }

  private async handleGetPopularImages(args: any) {
    const { page = 1, perPage = 20, orderBy = 'popular' } = args;
    
    const images = await this.scraper.getPopularImages(page, perPage, orderBy);
    
    return {
      content: [
        {
          type: 'text',
          text: `# Popular Images\n\n${JSON.stringify(images, null, 2)}`
        }
      ]
    };
  }

  private async handleBrowseCategory(args: any) {
    const { category, page = 1, perPage = 20 } = args;
    
    if (!category) {
      throw new McpError(ErrorCode.InvalidParams, 'Category parameter is required');
    }

    const images = await this.scraper.browseCategory(category, page, perPage);
    
    return {
      content: [
        {
          type: 'text',
          text: `# Category: ${category}\n\n${JSON.stringify(images, null, 2)}`
        }
      ]
    };
  }

  private async handleGetUserProfile(args: any) {
    const { username, includePhotos = true } = args;
    
    if (!username) {
      throw new McpError(ErrorCode.InvalidParams, 'Username parameter is required');
    }

    const profile = await this.scraper.getUserProfile(username, includePhotos);
    
    return {
      content: [
        {
          type: 'text',
          text: `# User Profile: ${username}\n\n${JSON.stringify(profile, null, 2)}`
        }
      ]
    };
  }

  private async handleGetImageDetails(args: any) {
    const { imageId, includeExif = false } = args;
    
    if (!imageId) {
      throw new McpError(ErrorCode.InvalidParams, 'Image ID parameter is required');
    }

    const image = await this.scraper.getImageDetails(imageId, includeExif);
    
    return {
      content: [
        {
          type: 'text',
          text: `# Image Details: ${imageId}\n\n${JSON.stringify(image, null, 2)}`
        }
      ]
    };
  }

  private async handleSearchByColor(args: any) {
    const { color, page = 1, perPage = 20 } = args;
    
    if (!color) {
      throw new McpError(ErrorCode.InvalidParams, 'Color parameter is required');
    }

    const images = await this.scraper.searchImages({
      query: '',
      page,
      perPage,
      color,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `# Images with color: ${color}\n\n${JSON.stringify(images, null, 2)}`
        }
      ]
    };
  }

  private async handleGetCollections(args: any) {
    const { page = 1, perPage = 20, featured = false } = args;
    
    // For now, return a placeholder as collections require more complex scraping
    const collections = [
      {
        message: 'Collections scraping not fully implemented yet',
        suggestion: 'Use search_images or browse_category instead',
        page,
        perPage,
        featured,
      }
    ];
    
    return {
      content: [
        {
          type: 'text',
          text: `# Collections\n\n${JSON.stringify(collections, null, 2)}`
        }
      ]
    };
  }

  private async handleGetCollectionPhotos(args: any) {
    const { collectionId, page = 1, perPage = 20 } = args;
    
    if (!collectionId) {
      throw new McpError(ErrorCode.InvalidParams, 'Collection ID parameter is required');
    }

    // For now, return a placeholder
    const photos = [
      {
        message: 'Collection photos scraping not fully implemented yet',
        suggestion: 'Use search_images with specific keywords instead',
        collectionId,
        page,
        perPage,
      }
    ];
    
    return {
      content: [
        {
          type: 'text',
          text: `# Collection Photos: ${collectionId}\n\n${JSON.stringify(photos, null, 2)}`
        }
      ]
    };
  }

  private async handleGetRandomPhotos(args: any) {
    const { count = 10, query, orientation } = args;
    
    const photos = await this.scraper.getRandomPhotos(count, query, orientation);
    
    return {
      content: [
        {
          type: 'text',
          text: `# Random Photos\n\n${JSON.stringify(photos, null, 2)}`
        }
      ]
    };
  }

  async run(): Promise<void> {
    // Validate configuration
    validateConfig();
    
    logger.info('Starting Unsplash MCP Server...', {
      version: '1.0.0',
      config: {
        userAgent: config.userAgent.substring(0, 50) + '...',
        requestDelay: config.requestDelay,
        cacheTtl: config.cacheTtl,
        maxRetries: config.maxRetries,
      }
    });

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    logger.info('Unsplash MCP Server running on stdio');
  }
}

// Run the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new UnsplashMCPServer();
  server.run().catch((error) => {
    logError(error);
    process.exit(1);
  });
}
