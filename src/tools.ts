export const toolDefinitions = [
  {
    name: 'search_images',
    description: 'Search for images on Unsplash using keywords and filters',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keywords (e.g., "mountain landscape", "city night")',
        },
        page: {
          type: 'integer',
          description: 'Page number for pagination',
          default: 1,
          minimum: 1,
        },
        perPage: {
          type: 'integer',
          description: 'Number of results per page',
          default: 20,
          minimum: 1,
          maximum: 50,
        },
        orientation: {
          type: 'string',
          description: 'Image orientation filter',
          enum: ['landscape', 'portrait', 'squarish'],
        },
        color: {
          type: 'string',
          description: 'Filter by dominant color',
          enum: ['black_and_white', 'black', 'white', 'yellow', 'orange', 'red', 'purple', 'magenta', 'green', 'teal', 'blue'],
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_popular_images',
    description: 'Get trending and popular images from Unsplash',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'integer',
          description: 'Page number for pagination',
          default: 1,
          minimum: 1,
        },
        perPage: {
          type: 'integer',
          description: 'Number of results per page',
          default: 20,
          minimum: 1,
          maximum: 50,
        },
        orderBy: {
          type: 'string',
          description: 'Sort order for results',
          enum: ['latest', 'oldest', 'popular'],
          default: 'popular',
        },
      },
    },
  },
  {
    name: 'browse_category',
    description: 'Browse images by specific categories or topics',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Category or topic name (e.g., "nature", "architecture", "food")',
        },
        page: {
          type: 'integer',
          description: 'Page number for pagination',
          default: 1,
          minimum: 1,
        },
        perPage: {
          type: 'integer',
          description: 'Number of results per page',
          default: 20,
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['category'],
    },
  },
  {
    name: 'get_user_profile',
    description: 'Get photographer information and their portfolio',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Unsplash username',
        },
        includePhotos: {
          type: 'boolean',
          description: 'Include user\'s recent photos',
          default: true,
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'get_image_details',
    description: 'Get comprehensive information about a specific image',
    inputSchema: {
      type: 'object',
      properties: {
        imageId: {
          type: 'string',
          description: 'Unsplash image ID',
        },
        includeExif: {
          type: 'boolean',
          description: 'Include EXIF data if available',
          default: false,
        },
      },
      required: ['imageId'],
    },
  },
  {
    name: 'search_by_color',
    description: 'Find images with specific dominant colors',
    inputSchema: {
      type: 'object',
      properties: {
        color: {
          type: 'string',
          description: 'Color name or hex code',
          enum: ['black_and_white', 'black', 'white', 'yellow', 'orange', 'red', 'purple', 'magenta', 'green', 'teal', 'blue'],
        },
        page: {
          type: 'integer',
          description: 'Page number for pagination',
          default: 1,
          minimum: 1,
        },
        perPage: {
          type: 'integer',
          description: 'Number of results per page',
          default: 20,
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['color'],
    },
  },
  {
    name: 'get_collections',
    description: 'Get curated collections of images',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'integer',
          description: 'Page number for pagination',
          default: 1,
          minimum: 1,
        },
        perPage: {
          type: 'integer',
          description: 'Number of results per page',
          default: 20,
          minimum: 1,
          maximum: 50,
        },
        featured: {
          type: 'boolean',
          description: 'Only show featured collections',
          default: false,
        },
      },
    },
  },
  {
    name: 'get_collection_photos',
    description: 'Get photos from a specific collection',
    inputSchema: {
      type: 'object',
      properties: {
        collectionId: {
          type: 'string',
          description: 'Collection ID',
        },
        page: {
          type: 'integer',
          description: 'Page number for pagination',
          default: 1,
          minimum: 1,
        },
        perPage: {
          type: 'integer',
          description: 'Number of results per page',
          default: 20,
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['collectionId'],
    },
  },
  {
    name: 'get_random_photos',
    description: 'Get random high-quality photos',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'integer',
          description: 'Number of random photos to get',
          default: 10,
          minimum: 1,
          maximum: 30,
        },
        query: {
          type: 'string',
          description: 'Optional query to filter random photos',
        },
        orientation: {
          type: 'string',
          description: 'Image orientation filter',
          enum: ['landscape', 'portrait', 'squarish'],
        },
      },
    },
  },
];
