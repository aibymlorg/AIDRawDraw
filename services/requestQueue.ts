/**
 * Request Queue Manager
 * Handles rate limiting and queuing for API requests to prevent crashes
 */

interface QueuedRequest<T> {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  retryCount: number;
  id: string;
}

class RequestQueueManager {
  private queue: QueuedRequest<any>[] = [];
  private isProcessing: boolean = false;
  private concurrentRequests: number = 0;
  private readonly MAX_CONCURRENT_REQUESTS: number = 3; // Max simultaneous requests
  private readonly MAX_RETRIES: number = 3;
  private readonly RETRY_DELAY_MS: number = 2000; // 2 seconds
  private readonly RATE_LIMIT_DELAY_MS: number = 1000; // 1 second between requests
  private lastRequestTime: number = 0;
  private requestCounter: number = 0;

  /**
   * Add a request to the queue
   */
  async enqueue<T>(requestFn: () => Promise<T>, priority: 'high' | 'normal' = 'normal'): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        execute: requestFn,
        resolve,
        reject,
        retryCount: 0,
        id: `req_${Date.now()}_${++this.requestCounter}`
      };

      // High priority requests go to the front
      if (priority === 'high') {
        this.queue.unshift(request);
      } else {
        this.queue.push(request);
      }

      console.log(`[Queue] Added request ${request.id}. Queue size: ${this.queue.length}`);

      this.processQueue();
    });
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.concurrentRequests < this.MAX_CONCURRENT_REQUESTS) {
      const request = this.queue.shift();
      if (!request) continue;

      // Respect rate limiting - ensure minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.RATE_LIMIT_DELAY_MS) {
        const delay = this.RATE_LIMIT_DELAY_MS - timeSinceLastRequest;
        console.log(`[Queue] Rate limit: waiting ${delay}ms before next request`);
        await this.sleep(delay);
      }

      this.lastRequestTime = Date.now();
      this.executeRequest(request);
    }

    this.isProcessing = false;
  }

  /**
   * Execute a single request with retry logic
   */
  private async executeRequest<T>(request: QueuedRequest<T>): Promise<void> {
    this.concurrentRequests++;
    console.log(`[Queue] Executing request ${request.id}. Concurrent: ${this.concurrentRequests}`);

    try {
      const result = await request.execute();
      request.resolve(result);
      console.log(`[Queue] Request ${request.id} completed successfully`);
    } catch (error: any) {
      console.error(`[Queue] Request ${request.id} failed:`, error);

      // Check if we should retry
      if (this.shouldRetry(error, request.retryCount)) {
        request.retryCount++;
        const retryDelay = this.RETRY_DELAY_MS * Math.pow(2, request.retryCount - 1); // Exponential backoff

        console.log(`[Queue] Retrying request ${request.id} (attempt ${request.retryCount}/${this.MAX_RETRIES}) after ${retryDelay}ms`);

        // Re-queue the request after delay
        await this.sleep(retryDelay);
        this.queue.unshift(request); // Add to front for retry
      } else {
        request.reject(error);
        console.error(`[Queue] Request ${request.id} failed permanently after ${request.retryCount} retries`);
      }
    } finally {
      this.concurrentRequests--;
      console.log(`[Queue] Request ${request.id} finished. Concurrent: ${this.concurrentRequests}, Queue size: ${this.queue.length}`);

      // Continue processing queue
      this.processQueue();
    }
  }

  /**
   * Determine if a request should be retried
   */
  private shouldRetry(error: any, retryCount: number): boolean {
    if (retryCount >= this.MAX_RETRIES) {
      return false;
    }

    // Retry on network errors, rate limit errors, or server errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const isRetryableError =
      errorMessage.includes('rate limit') ||
      errorMessage.includes('429') ||
      errorMessage.includes('503') ||
      errorMessage.includes('500') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('network') ||
      errorMessage.includes('fetch failed');

    return isRetryableError;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueSize: this.queue.length,
      concurrentRequests: this.concurrentRequests,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Clear the queue (use with caution)
   */
  clearQueue() {
    console.log(`[Queue] Clearing ${this.queue.length} pending requests`);
    this.queue.forEach(req => {
      req.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

// Export singleton instance
export const requestQueue = new RequestQueueManager();
