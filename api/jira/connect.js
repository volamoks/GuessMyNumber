import { Version3Client } from 'jira.js';

// Helper to create JIRA client
function createJiraClient(config) {
  return new Version3Client({
    host: config.host,
    authentication: {
      basic: {
        email: config.email,
        apiToken: config.apiToken,
      },
    },
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { host, email, apiToken } = req.body;

    if (!host || !email || !apiToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = createJiraClient({ host, email, apiToken });
    const user = await client.myself.getCurrentUser();

    res.json({
      success: true,
      user: {
        displayName: user.displayName,
        emailAddress: user.emailAddress,
      },
    });
  } catch (error) {
    console.error('JIRA connection error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Failed to connect to JIRA'
    });
  }
}
