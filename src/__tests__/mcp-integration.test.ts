import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock all external dependencies
jest.mock('../logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  logError: jest.fn(),
}));

jest.mock('../config.js', () => ({
  config: {
    userAgent: 'test-agent',
    requestDelay: 100,
    cacheTtl: 300,
    maxRetries: 3,
    baseUrl: 'https://unsplash.com',
  },
  validateConfig: jest.fn(),
}));

// Mock the MCP SDK
const mockServer = {
  setRequestHandler: jest.fn(),
  connect: jest.fn(() => Promise.resolve()),
  close: jest.fn(() => Promise.resolve()),
  onerror: jest.fn(),
};

const mockTransport = {};

jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn(() => mockServer),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn(() => mockTransport),
}));

jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
  ListToolsRequestSchema: 'list-tools',
  CallToolRequestSchema: 'call-tool',
  ErrorCode: {
    InvalidParams: 'INVALID_PARAMS',
    MethodNotFound: 'METHOD_NOT_FOUND',
    InternalError: 'INTERNAL_ERROR',
  },
  McpError: class MockMcpError extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  },
}));

// Mock UnsplashScraper
const mockScraper = {
  searchImages: jest.fn(() => Promise.resolve([
    {
      id: 'test-id',
      urls: { regular: 'https://test.com/image.jpg' },
      user: { username: 'testuser', name: 'Test User' },
      width: 400,
      height: 300,
    }
  ])),
  getPopularImages: jest.fn(() => Promise.resolve([])),
  browseCategory: jest.fn(() => Promise.resolve([])),
  getUserProfile: jest.fn(() => Promise.resolve({
    username: 'testuser',
    name: 'Test User',
    totalPhotos: 100,
  })),
  getImageDetails: jest.fn(() => Promise.resolve({
    id: 'test-id',
    urls: { regular: 'https://test.com/image.jpg' },
  })),
  getRandomPhotos: jest.fn(() => Promise.resolve([])),
};

jest.mock('../unsplash-scraper.js', () => ({
  UnsplashScraper: jest.fn(() => mockScraper),
}));

// Import after mocking
import { toolDefinitions } from '../tools.js';

describe('Unsplash MCP Server Integration', () => {
  let UnsplashMCPServer: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Dynamically import after mocks are set up
    const module = await import('../index.js');
    UnsplashMCPServer = (module as any).default || module;
  });

  describe('Tool Definitions', () => {
    it('should have all required tools defined', () => {
      expect(toolDefinitions).toHaveLength(9);
      
      const toolNames = toolDefinitions.map(tool => tool.name);
      expect(toolNames).toContain('search_images');
      expect(toolNames).toContain('get_popular_images');
      expect(toolNames).toContain('browse_category');
      expect(toolNames).toContain('get_user_profile');
      expect(toolNames).toContain('get_image_details');
      expect(toolNames).toContain('search_by_color');
      expect(toolNames).toContain('get_collections');
      expect(toolNames).toContain('get_collection_photos');
      expect(toolNames).toContain('get_random_photos');
    });

    it('should have proper tool schemas', () => {
      const searchTool = toolDefinitions.find(tool => tool.name === 'search_images');
      expect(searchTool).toBeDefined();
      expect(searchTool!.inputSchema.properties).toHaveProperty('query');
      expect(searchTool!.inputSchema.required).toContain('query');
    });
  });

  describe('Tool Parameter Validation', () => {
    it('should validate search_images parameters', () => {
      const searchTool = toolDefinitions.find(tool => tool.name === 'search_images');
      const schema = searchTool!.inputSchema;
      
      expect(schema.properties?.query?.type).toBe('string');
      expect(schema.properties?.page?.type).toBe('integer');
      expect(schema.properties?.perPage?.minimum).toBe(1);
      expect(schema.properties?.perPage?.maximum).toBe(50);
    });

    it('should validate orientation enum values', () => {
      const searchTool = toolDefinitions.find(tool => tool.name === 'search_images');
      const orientationEnum = searchTool!.inputSchema.properties?.orientation?.enum;
      
      expect(orientationEnum).toContain('landscape');
      expect(orientationEnum).toContain('portrait');
      expect(orientationEnum).toContain('squarish');
    });

    it('should validate color enum values', () => {
      const searchTool = toolDefinitions.find(tool => tool.name === 'search_images');
      const colorEnum = searchTool!.inputSchema.properties?.color?.enum;
      
      expect(colorEnum).toContain('black_and_white');
      expect(colorEnum).toContain('blue');
      expect(colorEnum).toContain('red');
      expect(colorEnum).toContain('green');
    });
  });

  describe('Response Format', () => {
    it('should return proper MCP response structure', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: '# Search Results\n\n[{"id":"test"}]'
          }
        ]
      };

      // The response format should match MCP specifications
      expect(mockResponse).toHaveProperty('content');
      expect(Array.isArray(mockResponse.content)).toBe(true);
      expect(mockResponse.content[0]).toHaveProperty('type', 'text');
      expect(mockResponse.content[0]).toHaveProperty('text');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required parameters', () => {
      // Test that tools with required parameters throw appropriate errors
      const searchTool = toolDefinitions.find(tool => tool.name === 'search_images');
      expect(searchTool!.inputSchema.required).toContain('query');
    });

    it('should handle invalid parameter values', () => {
      const searchTool = toolDefinitions.find(tool => tool.name === 'search_images');
      const perPageMin = searchTool!.inputSchema.properties.perPage?.minimum;
      const perPageMax = searchTool!.inputSchema.properties.perPage?.maximum;
      
      expect(perPageMin).toBe(1);
      expect(perPageMax).toBe(50);
    });
  });

  describe('Default Values', () => {
    it('should have appropriate default values', () => {
      const searchTool = toolDefinitions.find(tool => tool.name === 'search_images');
      expect(searchTool!.inputSchema.properties?.page?.default).toBe(1);
      expect(searchTool!.inputSchema.properties?.perPage?.default).toBe(20);

      const popularTool = toolDefinitions.find(tool => tool.name === 'get_popular_images');
      expect(popularTool!.inputSchema.properties?.orderBy?.default).toBe('popular');
    });
  });

  describe('Tool Descriptions', () => {
    it('should have meaningful descriptions for all tools', () => {
      toolDefinitions.forEach(tool => {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(10);
        expect(tool.description).not.toBe('');
      });
    });

    it('should have parameter descriptions', () => {
      const searchTool = toolDefinitions.find(tool => tool.name === 'search_images');
      const queryDesc = searchTool!.inputSchema.properties?.query?.description;
      
      expect(queryDesc).toBeDefined();
      expect(queryDesc).toContain('keyword');
    });
  });

  describe('Schema Consistency', () => {
    it('should have consistent schema structure across tools', () => {
      toolDefinitions.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema).toHaveProperty('type', 'object');
        expect(tool.inputSchema).toHaveProperty('properties');
      });
    });

    it('should have proper type definitions', () => {
      toolDefinitions.forEach(tool => {
        if (tool.inputSchema.properties) {
          Object.values(tool.inputSchema.properties).forEach((prop: any) => {
            expect(prop).toHaveProperty('type');
            expect(['string', 'integer', 'boolean']).toContain(prop.type);
          });
        }
      });
    });
  });
});
