import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  console.log('Request received for /get-word:', req); 
  console.log('Request query parameters:', req.query); 

  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', {
      statusCode: 405,
      headers: {
        'Allow': 'GET',
      },
    });
  }

  // Manually parse query parameters from req.url
  const url = new URL(req.url); // Create URL object from request URL
  const gameId = url.searchParams.get('gameId'); // Use URLSearchParams to get 'gameId'

  console.log('Parsed gameId from URL:', gameId); // Log parsed gameId

  if (!gameId) {
    return new Response(JSON.stringify({ error: 'Game ID is required' }), {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const blobStore = getStore({ name: 'customWordleGames', context });
    const word = await blobStore.get(gameId);

    if (!word) {
      return new Response(JSON.stringify({ error: 'Game not found' }), {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ word }), {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting word:', error);
    return new Response(JSON.stringify({ error: 'Failed to get word' }), {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config = { path: "/get-word" };