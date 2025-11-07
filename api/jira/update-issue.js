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
    const { host, email, apiToken, issueKey, updates } = req.body;
    const client = createJiraClient({ host, email, apiToken });

    const fields = {};
    if (updates.summary) fields.summary = updates.summary;
    if (updates.dueDate) fields.duedate = updates.dueDate;

    await client.issues.editIssue({
      issueIdOrKey: issueKey,
      fields,
    });

    res.json({
      success: true,
      message: `Issue ${issueKey} updated successfully`,
    });
  } catch (error) {
    console.error('Failed to update issue:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update issue'
    });
  }
}
