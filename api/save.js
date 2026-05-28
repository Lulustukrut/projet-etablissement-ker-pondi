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
      // If it's already https://, use it directly — but we still need a token
      if (parsed.protocol === 'https:') {
        return new Redis({
          url: url,
          token: process.env.REDIS_TOKEN || parsed.password || '',
        });
      }
      // If it's redis:// or rediss://, extract host and password
      const restUrl = 'https://' + parsed.hostname;
      const token = parsed.password;
      return new Redis({ url: restUrl, token });
    } catch (e) {
      // Not a valid URL
    }
  }

  throw new Error('No Redis configuration found. Set REDIS_URL or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN');
}

const redis = getRedis();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { content } = request.body;

    if (!content) {
      return response.status(400).json({ error: 'Content is required' });
    }

    await redis.set('document_content', content);

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving to Redis:', error);
    return response.status(500).json({ error: 'Failed to save: ' + error.message });
  }
}
