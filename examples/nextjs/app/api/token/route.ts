import Cartesia from '@cartesia/cartesia-js';

const client = new Cartesia({ apiKey: process.env['CARTESIA_API_KEY'] });

export async function POST() {
  const { token } = await client.accessToken.create({
    grants: { tts: true },
    expires_in: 300,
  });
  return Response.json({ token });
}
