import { GoogleGenerativeAI } from "@google/generative-ai";

export class APIKeyManager {
  private apiKeys: string[] = [];
  private currentIndex = 0;
  private failedKeys = new Set<string>();
  private lastUsedTimes = new Map<string, number>();
  private rateLimits = new Map<string, { count: number, resetTime: number }>();

  constructor(apiKeys: string[]) {
    this.apiKeys = apiKeys;
    this.initializeRateLimits();
  }

  private initializeRateLimits() {
    this.apiKeys.forEach(key => {
      this.lastUsedTimes.set(key, 0);
      this.rateLimits.set(key, { count: 0, resetTime: Date.now() });
    });
  }

  public getNextAPIKey(): string {
    const now = Date.now();
    let attempts = 0;
    const maxAttempts = this.apiKeys.length;

    while (attempts < maxAttempts) {
      const key = this.apiKeys[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;

      // Skip failed keys
      if (this.failedKeys.has(key)) {
        attempts++;
        continue;
      }

      // Check rate limits
      const rateLimit = this.rateLimits.get(key);
      if (rateLimit) {
        // Reset counter if time window has passed (60 seconds)
        if (now - rateLimit.resetTime > 60000) {
          this.rateLimits.set(key, { count: 0, resetTime: now });
        }
        
        // Skip if rate limit exceeded (60 requests per minute)
        if (rateLimit.count >= 60) {
          attempts++;
          continue;
        }

        // Update rate limit counter
        this.rateLimits.set(key, { 
          count: rateLimit.count + 1, 
          resetTime: rateLimit.resetTime 
        });
      }

      // Update last used time
      this.lastUsedTimes.set(key, now);
      return key;
    }

    throw new Error("All API keys are either failed or rate limited");
  }

  public markKeyAsFailed(key: string) {
    this.failedKeys.add(key);
    console.warn(`API key marked as failed: ${key.substring(0, 8)}...`);

    // If all keys have failed, reset after a delay
    if (this.failedKeys.size === this.apiKeys.length) {
      setTimeout(() => {
        this.failedKeys.clear();
        console.log("Resetting failed API keys status");
      }, 60000); // Reset after 1 minute
    }
  }

  public resetKey(key: string) {
    this.failedKeys.delete(key);
  }

  public async createGeminiClient(retries = 3): Promise<GoogleGenerativeAI> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const key = this.getNextAPIKey();
        return new GoogleGenerativeAI(key);
      } catch (error) {
        lastError = error as Error;
        console.error(`Failed to create Gemini client (attempt ${i + 1}/${retries}):`, error);
      }
    }

    throw lastError || new Error("Failed to create Gemini client after multiple attempts");
  }
} 