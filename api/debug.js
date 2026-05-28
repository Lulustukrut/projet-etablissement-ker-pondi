export default async function handler(request, response) {
  const redisUrl = process.env.REDIS_URL || 'NOT SET';
  // Only show the protocol and host, mask the password
  let debugInfo = '';
  try {
    const parsed = new URL(redisUrl);
    debugInfo = `protocol=${parsed.protocol} host=${parsed.hostname} port=${parsed.port} hasPassword=${!!parsed.password} username=${parsed.username}`;
  } catch(e) {
    debugInfo = 'Could not parse URL: ' + e.message;
  }

  const allEnvKeys = Object.keys(process.env).filter(k => 
    k.includes('REDIS') || k.includes('KV') || k.includes('UPSTASH')
  );

  return response.status(200).json({ 
    debugInfo, 
    envKeys: allEnvKeys,
    urlStartsWith: redisUrl.substring(0, 30) + '...'
  });
}
