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

    console.log('Updating issue:', issueKey, 'with updates:', updates);

    const fields = {};

    // Basic fields
    if (updates.summary !== undefined) fields.summary = updates.summary;
    if (updates.description !== undefined) fields.description = updates.description;
    if (updates.dueDate !== undefined) fields.duedate = updates.dueDate;

    // Priority (name or object with id/name)
    if (updates.priority !== undefined) {
      fields.priority = typeof updates.priority === 'string'
        ? { name: updates.priority }
        : updates.priority;
    }

    // Labels (array of strings)
    if (updates.labels !== undefined) {
      fields.labels = Array.isArray(updates.labels) ? updates.labels : [];
    }

    // Components (array of component names or objects)
    if (updates.components !== undefined) {
      fields.components = Array.isArray(updates.components)
        ? updates.components.map(c => typeof c === 'string' ? { name: c } : c)
        : [];
    }

    // Assignee (accountId or object with accountId)
    if (updates.assignee !== undefined) {
      if (updates.assignee === null) {
        fields.assignee = null; // Unassign
      } else {
        fields.assignee = typeof updates.assignee === 'string'
          ? { accountId: updates.assignee }
          : updates.assignee;
      }
    }

    // Reporter (accountId or object with accountId) - some JIRA instances don't allow changing
    if (updates.reporter !== undefined) {
      fields.reporter = typeof updates.reporter === 'string'
        ? { accountId: updates.reporter }
        : updates.reporter;
    }

    // Epic (customfield_10014) - epic link
    if (updates.epic !== undefined) {
      fields.customfield_10014 = updates.epic;
    }

    // Sprint (customfield_10020) - sprint id or array
    if (updates.sprint !== undefined) {
      fields.customfield_10020 = Array.isArray(updates.sprint)
        ? updates.sprint
        : [updates.sprint];
    }

    // Resolution
    if (updates.resolution !== undefined) {
      fields.resolution = updates.resolution === null
        ? null
        : (typeof updates.resolution === 'string' ? { name: updates.resolution } : updates.resolution);
    }

    console.log('Prepared fields for update:', JSON.stringify(fields, null, 2));

    await client.issues.editIssue({
      issueIdOrKey: issueKey,
      fields,
    });

    res.json({
      success: true,
      message: `Issue ${issueKey} updated successfully`,
      updatedFields: Object.keys(fields),
    });
  } catch (error) {
    console.error('Failed to update issue:', error);
    console.error('Error details:', error.response?.data);

    const errorMessage = error.response?.data?.errorMessages?.[0]
      || error.response?.data?.errors
      || error.message
      || 'Failed to update issue';

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.response?.data || null
    });
  }
}
