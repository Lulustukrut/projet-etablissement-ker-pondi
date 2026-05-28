import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

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
