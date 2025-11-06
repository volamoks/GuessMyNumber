import express from 'express';
import cors from 'cors';
import { Version3Client } from 'jira.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Store JIRA clients per session (in production use Redis or DB)
const jiraClients = new Map();

// Helper to create JIRA client
function createJiraClient(config) {
  const clientKey = `${config.host}-${config.email}`;

  if (!jiraClients.has(clientKey)) {
    const client = new Version3Client({
      host: config.host,
      authentication: {
        basic: {
          email: config.email,
          apiToken: config.apiToken,
        },
      },
    });
    jiraClients.set(clientKey, client);
  }

  return jiraClients.get(clientKey);
}

// Routes

// Test connection
app.post('/api/jira/connect', async (req, res) => {
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
});

// Get projects
app.post('/api/jira/projects', async (req, res) => {
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
});

// Get issues
app.post('/api/jira/issues', async (req, res) => {
  try {
    const { host, email, apiToken, projectKey, jql, maxResults = 100 } = req.body;
    const client = createJiraClient({ host, email, apiToken });

    const query = jql || `project = ${projectKey} ORDER BY created DESC`;

    // Use the new Enhanced Search method which uses /rest/api/3/search/jql endpoint
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
      startDate: issue.fields.created, // Use created date as fallback
      estimatedHours: undefined, // Will be calculated from date range
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

    // Provide more detailed error information
    const errorMessage = error.response?.data?.errorMessages?.[0] || error.message || 'Failed to fetch issues';
    const statusCode = error.status || 500;

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.response?.data || null
    });
  }
});

// Update issue
app.post('/api/jira/update-issue', async (req, res) => {
  try {
    const { host, email, apiToken, issueKey, updates } = req.body;
    const client = createJiraClient({ host, email, apiToken });

    const fields = {};
    if (updates.summary) fields.summary = updates.summary;
    if (updates.dueDate) fields.duedate = updates.dueDate;
    // Don't try to update start date as it may not exist

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
});

app.listen(PORT, () => {
  console.log(`🚀 JIRA Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from: http://localhost:5174`);
});
