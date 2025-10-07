# Multi-User Request Handling

## Problem
When multiple users access the application simultaneously and make requests to the Gemini API, several issues can occur:
- **Rate limiting**: Gemini API has rate limits (requests per minute/day)
- **429 errors**: Too many requests at once
- **503/500 errors**: Server overload
- **Crashes**: Unhandled concurrent requests

## Solution Architecture

### 1. Request Queue Manager (`services/requestQueue.ts`)

A sophisticated queue system that handles all API requests with the following features:

#### Key Features:
- **Concurrent Request Limiting**: Max 3 simultaneous requests
- **Rate Limiting**: 1 second minimum delay between requests
- **Automatic Retry**: Up to 3 retries with exponential backoff
- **Priority Queue**: High-priority requests (chat) go first
- **Error Handling**: Graceful degradation on failures

#### Configuration:
```typescript
MAX_CONCURRENT_REQUESTS = 3     // Max parallel requests
MAX_RETRIES = 3                 // Retry attempts
RETRY_DELAY_MS = 2000          // Initial retry delay (2s)
RATE_LIMIT_DELAY_MS = 1000     // Min delay between requests (1s)
```

#### How It Works:
1. **Enqueue**: All API requests are added to a queue
2. **Rate Limit**: System ensures minimum delay between requests
3. **Concurrency Control**: Only 3 requests run simultaneously
4. **Retry Logic**: Failed requests retry with exponential backoff
5. **Priority**: Chat messages have higher priority than enhancements

### 2. Integration Points

#### Image Enhancement Service
```typescript
// All enhancement requests go through queue
export const enhanceImage = async (params) => {
  return requestQueue.enqueue(async () => {
    // API call here
  }, 'normal'); // Normal priority
};
```

#### Chat Service
```typescript
// Chat messages have high priority
async *sendMessageStream(params) {
  const stream = await requestQueue.enqueue(async () => {
    return await this.geminiChat.sendMessageStream(params);
  }, 'high'); // High priority
}
```

### 3. User Feedback

#### Queue Status Indicator (`components/QueueStatusIndicator.tsx`)
- **Visual Indicator**: Shows when requests are being processed
- **Queue Size**: Displays number of waiting requests
- **Active Requests**: Shows concurrent processing count
- **Auto-hide**: Only visible when there's activity

Located in bottom-right corner of the screen.

## Retry Strategy

### Retryable Errors:
- Rate limit errors (429)
- Server errors (500, 503)
- Timeout errors
- Network failures

### Exponential Backoff:
- 1st retry: 2 seconds
- 2nd retry: 4 seconds
- 3rd retry: 8 seconds

### Non-Retryable Errors:
- Authentication errors (401)
- Invalid requests (400)
- Content policy violations

## Scaling Recommendations

### For Light Traffic (< 10 concurrent users):
Current settings are optimal:
```typescript
MAX_CONCURRENT_REQUESTS = 3
RATE_LIMIT_DELAY_MS = 1000
```

### For Medium Traffic (10-50 concurrent users):
Increase concurrency slightly:
```typescript
MAX_CONCURRENT_REQUESTS = 5
RATE_LIMIT_DELAY_MS = 500
```

### For Heavy Traffic (50+ concurrent users):
Consider backend implementation:
1. **Server-side Queue**: Move queue to backend
2. **Multiple API Keys**: Rotate between keys
3. **Redis Queue**: Use Redis for distributed queue
4. **Load Balancing**: Distribute across multiple servers

## Advanced Options

### 1. API Key Rotation
If you have multiple Gemini API keys:
```typescript
const API_KEYS = [
  'key1',
  'key2',
  'key3'
];

let currentKeyIndex = 0;

function getNextAPIKey() {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}
```

### 2. User-based Rate Limiting
Track requests per user:
```typescript
const userRequestCounts = new Map<string, number>();

function checkUserRateLimit(userId: string): boolean {
  const count = userRequestCounts.get(userId) || 0;
  if (count > MAX_REQUESTS_PER_USER_PER_MINUTE) {
    return false; // Rate limited
  }
  userRequestCounts.set(userId, count + 1);
  return true;
}
```

### 3. Backend Queue (Recommended for Production)
Implement a backend service with:
- **Bull Queue** (Redis-based)
- **RabbitMQ** for message queuing
- **AWS SQS** for cloud-based queue
- **Google Cloud Tasks** for Gemini integration

Example with Bull:
```typescript
import Bull from 'bull';

const enhancementQueue = new Bull('image-enhancement', {
  redis: { host: 'localhost', port: 6379 }
});

enhancementQueue.process(async (job) => {
  const { imageData, style } = job.data;
  return await callGeminiAPI(imageData, style);
});
```

## Monitoring

### Log Analysis
Monitor these patterns:
```bash
# Check queue activity
grep "\[Queue\]" logs.txt

# Check retry patterns
grep "Retrying request" logs.txt

# Check failures
grep "failed permanently" logs.txt
```

### Metrics to Track:
- Average queue wait time
- Retry rate (should be < 10%)
- Concurrent request utilization
- Error rate by type

## Best Practices

1. **Always use the queue**: Never bypass for API calls
2. **Set appropriate priorities**: Chat > Enhancement
3. **Monitor queue size**: Alert if > 20 requests
4. **Log all errors**: For debugging rate limits
5. **Inform users**: Show queue status indicator
6. **Implement timeouts**: Don't let requests hang forever
7. **Circuit breaker**: Stop requests if API is down

## Testing Multi-User Scenarios

### Simulate Multiple Users:
```typescript
// Test concurrent requests
async function testConcurrentRequests() {
  const requests = Array(10).fill(null).map((_, i) =>
    enhanceImage({
      imageData: testImageData,
      style: ENHANCEMENT_STYLES[0]
    })
  );

  const results = await Promise.allSettled(requests);
  console.log('Success:', results.filter(r => r.status === 'fulfilled').length);
  console.log('Failed:', results.filter(r => r.status === 'rejected').length);
}
```

## Troubleshooting

### Issue: "Too many requests in queue"
**Solution**:
- Increase `MAX_CONCURRENT_REQUESTS`
- Decrease `RATE_LIMIT_DELAY_MS`
- Check if API key has sufficient quota

### Issue: "All requests failing"
**Solution**:
- Check API key validity
- Verify network connectivity
- Check Gemini API status

### Issue: "Slow processing"
**Solution**:
- Reduce `RATE_LIMIT_DELAY_MS` if quota allows
- Increase `MAX_CONCURRENT_REQUESTS`
- Consider upgrading API plan

## Summary

This queue-based approach provides:
✅ **Resilience**: Automatic retries and error handling
✅ **Fair Usage**: Rate limiting prevents API abuse
✅ **User Experience**: Visual feedback and priority handling
✅ **Scalability**: Easy to adjust for traffic levels
✅ **Reliability**: Prevents crashes from concurrent access

For production deployments with 50+ concurrent users, consider moving to a backend queue system with Redis or a cloud-based solution.
