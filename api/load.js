import { Redis } from '@upstash/redis';

function getRedis() {
  // Try standard Upstash env vars first
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  // Try REDIS_URL + REDIS_TOKEN
  if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
    return new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
  }

  // Parse REDIS_URL if it's a redis:// or rediss:// connection string
  if (process.env.REDIS_URL) {
    const url = process.env.REDIS_URL;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'https:') {
        return new Redis({
          url: url,
          token: process.env.REDIS_TOKEN || parsed.password || '',
        });
      }
      const restUrl = 'https://' + parsed.hostname;
      const token = parsed.password;
      return new Redis({ url: restUrl, token });
    } catch (e) {
      // Not a valid URL
    }
  }

  throw new Error('No Redis configuration found.');
}

const redis = getRedis();

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const content = await redis.get('document_content');

    if (!content) {
      return response.status(404).json({ error: 'No content found' });
    }

    return response.status(200).json({ content });
  } catch (error) {
    console.error('Error loading from Redis:', error);
    return response.status(500).json({ error: 'Failed to load: ' + error.message });
  }
}
