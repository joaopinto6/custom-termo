import { nanoid } from 'nanoid';
import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { // Return Response object
      statusCode: 405,
      headers: {
        'Allow': 'POST',
      },
    });
  }

  try {
    const { word } = await req.json();

    if (!word) {
      return new Response(JSON.stringify({ error: 'Word is required' }), { // Return Response object
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const gameId = nanoid();
    const blobStore = getStore({ name: 'customWordleGames', context });
    const blob = blobStore;

    await blob.set(gameId, word);

    return new Response(JSON.stringify({ gameId }), { // Return Response object
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return new Response(JSON.stringify({ error: 'Failed to create game' }), { // Return Response object
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config = { path: "/create-game" };