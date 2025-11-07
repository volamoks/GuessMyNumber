import { Version3Client } from 'jira.js';

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
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { host, email, apiToken } = req.body;
    const client = createJiraClient({ host, email, apiToken });

    const projects = await client.projects.searchProjects({
      maxResults: 100,
    });

    res.json({
      success: true,
      projects: projects.values?.map(p => ({
        key: p.key,
        name: p.name,
        id: p.id,
      })) || [],
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch projects'
    });
  }
}
