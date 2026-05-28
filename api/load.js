import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get the HTML content from Vercel KV
    const content = await kv.get('document_content');

    if (!content) {
      return response.status(404).json({ error: 'No content found' });
    }

    return response.status(200).json({ content });
  } catch (error) {
    console.error('Error loading from KV:', error);
    return response.status(500).json({ error: 'Failed to load from database' });
  }
}
