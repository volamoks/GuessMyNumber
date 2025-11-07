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
    const { host, email, apiToken, projectKey, jql, maxResults = 100 } = req.body;
    const client = createJiraClient({ host, email, apiToken });

    const query = jql || `project = ${projectKey} ORDER BY created DESC`;

    const response = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
      jql: query,
      maxResults,
      fields: [
        'summary',
        'description',
        'status',
        'assignee',
        'priority',
        'issuetype',
        'duedate',
        'created',
        'updated',
        'parent',
        'labels',
        'subtasks',
      ],
    });

    const issues = response.issues?.map(issue => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description,
      status: issue.fields.status.name,
      assignee: issue.fields.assignee?.displayName,
      priority: issue.fields.priority?.name,
      issueType: issue.fields.issuetype.name,
      dueDate: issue.fields.duedate,
      startDate: issue.fields.created,
      estimatedHours: undefined,
      parentKey: issue.fields.parent?.key,
      labels: issue.fields.labels || [],
      subtasks: issue.fields.subtasks?.map(subtask => ({
        id: subtask.id,
        key: subtask.key,
        summary: subtask.fields.summary,
        status: subtask.fields.status.name,
        issueType: subtask.fields.issuetype.name,
      })) || [],
    })) || [];

    res.json({
      success: true,
      issues,
    });
  } catch (error) {
    console.error('Failed to fetch issues:', error);

    const errorMessage = error.response?.data?.errorMessages?.[0] || error.message || 'Failed to fetch issues';
    const statusCode = error.status || 500;

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.response?.data || null
    });
  }
}
