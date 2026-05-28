import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

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
