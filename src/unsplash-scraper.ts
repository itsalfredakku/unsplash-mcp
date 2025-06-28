import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import * as cheerio from 'cheerio';
import { logger, logApiCall, logError, logScrapeActivity } from './logger.js';
import { SimpleCache } from './cache.js';
import { config } from './config.js';

export interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export interface UnsplashImage {
  id: string;
  urls: {
    raw?: string;
    full?: string;
    regular?: string;
    small?: string;
    thumb?: string;
  };
  width: number;
  height: number;
  description?: string;
  altDescription?: string;
  user: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
    portfolioUrl?: string;
  };
  likes: number;
  downloads?: number;
  tags?: string[];
  color?: string;
  createdAt?: string;
  location?: {
    name?: string;
    city?: string;
    country?: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio?: string;
  location?: string;
  portfolioUrl?: string;
  instagramUsername?: string;
  twitterUsername?: string;
  totalPhotos: number;
  totalLikes: number;
  totalCollections: number;
  profileImage?: string;
  photos?: UnsplashImage[];
}

export interface Collection {
  id: string;
  title: string;
  description?: string;
  totalPhotos: number;
  coverPhoto?: UnsplashImage;
  user: {
    username: string;
    name: string;
  };
  tags?: string[];
}

// Search parameters interface
export interface SearchParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: string;
}

// Helper function for error handling
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

// Delay helper function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class UnsplashScraper {
  private client: AxiosInstance;
  private cache: SimpleCache;
  private lastRequestTime: number = 0;

  constructor() {
    this.cache = new SimpleCache(config.cacheTtl);
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000,
    });

    // Add retry logic
    axiosRetry(this.client, {
      retries: config.maxRetries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: any) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429 || // Rate limit
          error.response?.status === 503;   // Service unavailable
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: AxiosError) => {
        if (error.response) {
          const message = `HTTP ${error.response.status}: ${error.response.statusText}`;
          logError(new Error(`Unsplash Scraping Error: ${message}`));
          throw new Error(`Unsplash Scraping Error: ${message}`);
        } else if (error.request) {
          const networkError = new Error('Network error: Unable to reach Unsplash');
          logError(networkError);
          throw networkError;
        }
        throw error;
      }
    );
  }

  // Rate limiting
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < config.requestDelay) {
      const waitTime = config.requestDelay - timeSinceLastRequest;
      await delay(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  // Generic scrape method
  private async scrapeUrl(url: string, cacheKey?: string): Promise<cheerio.CheerioAPI> {
    await this.rateLimit();

    if (cacheKey) {
      const cached = this.cache.get<string>(cacheKey);
      if (cached) {
        logScrapeActivity('CACHE_HIT', url);
        return cheerio.load(cached);
      }
    }

    logScrapeActivity('REQUEST', url);
    const startTime = Date.now();
    
    try {
      const response = await this.client.get(url);
      const duration = Date.now() - startTime;
      
      logApiCall('GET', url, response.status, duration);
      
      if (cacheKey) {
        this.cache.set(cacheKey, response.data);
      }
      
      return cheerio.load(response.data);
    } catch (error) {
      logError(error as Error, { url });
      throw error;
    }
  }

  // Extract image data from HTML elements
  private extractImageData($: cheerio.CheerioAPI, element: any): UnsplashImage | null {
    try {
      const $img = $(element);
      const $link = $img.closest('a');
      
      // Extract image ID from URL
      const href = $link.attr('href');
      const idMatch = href?.match(/\/photos\/([^/?]+)/);
      if (!idMatch) return null;
      
      const id = idMatch[1];
      
      // Extract image URLs
      const src = $img.attr('src') || '';
      const srcset = $img.attr('srcset') || '';
      
      // Parse different sizes from srcset
      const urls: UnsplashImage['urls'] = {};
      if (src.includes('?')) {
        const baseUrl = src.split('?')[0];
        urls.thumb = `${baseUrl}?w=200&h=200&fit=crop`;
        urls.small = `${baseUrl}?w=400&h=400&fit=crop`;
        urls.regular = `${baseUrl}?w=1080&h=1080&fit=crop`;
        urls.full = baseUrl;
      }
      
      // Extract dimensions
      const width = parseInt($img.attr('width') || '0');
      const height = parseInt($img.attr('height') || '0');
      
      // Extract alt text and description
      const altDescription = $img.attr('alt') || '';
      
      // Extract user info from nearby elements
      const $userLink = $link.siblings().find('a[href*="/users/"]').first();
      const userHref = $userLink.attr('href') || '';
      const usernameMatch = userHref.match(/\/users\/([^/?]+)/);
      
      const user = {
        id: usernameMatch?.[1] || '',
        username: usernameMatch?.[1] || '',
        name: $userLink.text().trim() || 'Unknown',
        profileImage: '',
        portfolioUrl: '',
      };

      return {
        id,
        urls,
        width,
        height,
        altDescription,
        user,
        likes: 0, // Will be extracted from detail page if needed
        tags: [],
        color: '',
      };
    } catch (error) {
      logError(error as Error, { element: element.toString() });
      return null;
    }
  }

  // Search images
  async searchImages(params: SearchParams): Promise<UnsplashImage[]> {
    try {
      const { query, page = 1, perPage = 20, orientation, color } = params;
      
      let url = `/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
      
      if (orientation) {
        url += `&orientation=${orientation}`;
      }
      
      if (color) {
        url += `&color=${color}`;
      }

      const cacheKey = `search:${url}`;
      const $ = await this.scrapeUrl(url, cacheKey);
      
      const images: UnsplashImage[] = [];
      
      // Look for image elements in search results
      $('img[src*="images.unsplash.com"]').each((_: any, element: any) => {
        const imageData = this.extractImageData($, element);
        if (imageData) {
          images.push(imageData);
        }
      });

      logScrapeActivity('SEARCH_COMPLETE', query, { count: images.length });
      return images.slice(0, perPage);
      
    } catch (error) {
      logError(error as Error, { action: 'searchImages', params });
      throw new Error(`Failed to search images: ${getErrorMessage(error)}`);
    }
  }

  // Get popular images
  async getPopularImages(page: number = 1, perPage: number = 20, orderBy: string = 'popular'): Promise<UnsplashImage[]> {
    try {
      const url = `/?page=${page}&per_page=${perPage}&order_by=${orderBy}`;
      const cacheKey = `popular:${page}:${perPage}:${orderBy}`;
      
      const $ = await this.scrapeUrl(url, cacheKey);
      
      const images: UnsplashImage[] = [];
      
      $('img[src*="images.unsplash.com"]').each((_: any, element: any) => {
        const imageData = this.extractImageData($, element);
        if (imageData) {
          images.push(imageData);
        }
      });

      logScrapeActivity('POPULAR_COMPLETE', 'popular images', { count: images.length });
      return images.slice(0, perPage);
      
    } catch (error) {
      logError(error as Error, { action: 'getPopularImages', page, perPage });
      throw new Error(`Failed to get popular images: ${getErrorMessage(error)}`);
    }
  }

  // Browse category
  async browseCategory(category: string, page: number = 1, perPage: number = 20): Promise<UnsplashImage[]> {
    try {
      const url = `/t/${encodeURIComponent(category)}?page=${page}&per_page=${perPage}`;
      const cacheKey = `category:${category}:${page}:${perPage}`;
      
      const $ = await this.scrapeUrl(url, cacheKey);
      
      const images: UnsplashImage[] = [];
      
      $('img[src*="images.unsplash.com"]').each((_: any, element: any) => {
        const imageData = this.extractImageData($, element);
        if (imageData) {
          images.push(imageData);
        }
      });

      logScrapeActivity('CATEGORY_COMPLETE', category, { count: images.length });
      return images.slice(0, perPage);
      
    } catch (error) {
      logError(error as Error, { action: 'browseCategory', category, page });
      throw new Error(`Failed to browse category: ${getErrorMessage(error)}`);
    }
  }

  // Get user profile
  async getUserProfile(username: string, includePhotos: boolean = true): Promise<UserProfile> {
    try {
      const url = `/@${username}`;
      const cacheKey = `user:${username}`;
      
      const $ = await this.scrapeUrl(url, cacheKey);
      
      // Extract user info from the page
      const name = $('h1').first().text().trim() || username;
      const bio = $('[data-test="user-bio"]').text().trim();
      const location = $('[data-test="user-location"]').text().trim();
      
      // Extract stats
      const totalPhotos = parseInt($('[data-test="user-total-photos"]').text().replace(/[^\d]/g, '') || '0');
      const totalLikes = parseInt($('[data-test="user-total-likes"]').text().replace(/[^\d]/g, '') || '0');
      const totalCollections = parseInt($('[data-test="user-total-collections"]').text().replace(/[^\d]/g, '') || '0');
      
      let photos: UnsplashImage[] = [];
      
      if (includePhotos) {
        $('img[src*="images.unsplash.com"]').each((_: any, element: any) => {
          const imageData = this.extractImageData($, element);
          if (imageData && photos.length < 12) { // Limit to 12 recent photos
            photos.push(imageData);
          }
        });
      }

      const profile: UserProfile = {
        id: username,
        username,
        name,
        bio: bio || undefined,
        location: location || undefined,
        totalPhotos,
        totalLikes,
        totalCollections,
        photos: includePhotos ? photos : undefined,
      };

      logScrapeActivity('USER_PROFILE_COMPLETE', username, { photosCount: photos.length });
      return profile;
      
    } catch (error) {
      logError(error as Error, { action: 'getUserProfile', username });
      throw new Error(`Failed to get user profile: ${getErrorMessage(error)}`);
    }
  }

  // Get image details
  async getImageDetails(imageId: string, includeExif: boolean = false): Promise<UnsplashImage> {
    try {
      const url = `/photos/${imageId}`;
      const cacheKey = `image:${imageId}`;
      
      const $ = await this.scrapeUrl(url, cacheKey);
      
      // Extract detailed image information
      const $img = $('img[src*="images.unsplash.com"]').first();
      
      if (!$img.length) {
        throw new Error('Image not found');
      }

      const imageData = this.extractImageData($, $img[0]);
      
      if (!imageData) {
        throw new Error('Failed to extract image data');
      }

      // Extract additional details from the page
      const description = $('[data-test="photo-description"]').text().trim();
      const tags = $('[data-test="photo-tag"]').map((_: any, el: any) => $(el).text().trim()).get();
      const likes = parseInt($('[data-test="photo-likes-count"]').text().replace(/[^\d]/g, '') || '0');
      const downloads = parseInt($('[data-test="photo-downloads-count"]').text().replace(/[^\d]/g, '') || '0');

      const detailedImage: UnsplashImage = {
        ...imageData,
        description: description || imageData.altDescription,
        tags,
        likes,
        downloads,
      };

      logScrapeActivity('IMAGE_DETAILS_COMPLETE', imageId);
      return detailedImage;
      
    } catch (error) {
      logError(error as Error, { action: 'getImageDetails', imageId });
      throw new Error(`Failed to get image details: ${getErrorMessage(error)}`);
    }
  }

  // Get random photos
  async getRandomPhotos(count: number = 10, query?: string, orientation?: string): Promise<UnsplashImage[]> {
    try {
      let url = '/';
      
      if (query) {
        url = `/search/photos?query=${encodeURIComponent(query)}&order_by=random`;
      }
      
      const cacheKey = `random:${count}:${query || 'all'}:${orientation || 'any'}`;
      const $ = await this.scrapeUrl(url, cacheKey);
      
      const images: UnsplashImage[] = [];
      
      $('img[src*="images.unsplash.com"]').each((_: any, element: any) => {
        const imageData = this.extractImageData($, element);
        if (imageData && images.length < count) {
          images.push(imageData);
        }
      });

      // Shuffle the results to make them more random
      for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
      }

      logScrapeActivity('RANDOM_PHOTOS_COMPLETE', query || 'all', { count: images.length });
      return images.slice(0, count);
      
    } catch (error) {
      logError(error as Error, { action: 'getRandomPhotos', count, query });
      throw new Error(`Failed to get random photos: ${getErrorMessage(error)}`);
    }
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
    logScrapeActivity('CACHE_CLEARED', 'all');
  }

  getCacheSize(): number {
    return this.cache.size();
  }
}
