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

    // Use new Enhanced Search API (required by JIRA Cloud as of 2024)
    // Old searchForIssuesUsingJql was deprecated and removed
    console.log('Making JIRA Cloud API request...');
    const response = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
      jql: query,
      maxResults,
      fields: ['*all'], // Enhanced Search REQUIRES fields parameter - use array with '*all'
    });
    console.log('JIRA API response received, issues count:', response.issues?.length || 0);

    // DEBUG: Log response structure
    if (response.issues && response.issues.length > 0) {
      console.log('===== FIRST ISSUE STRUCTURE =====');
      console.log('Issue keys:', Object.keys(response.issues[0]));
      console.log('Has fields?', 'fields' in response.issues[0]);
      console.log('Fields keys:', response.issues[0].fields ? Object.keys(response.issues[0].fields) : 'NO FIELDS');
      console.log('First issue:', JSON.stringify(response.issues[0], null, 2));
      console.log('==================================');
    }

    const issues = response.issues?.map(issue => {
      if (!issue.fields) {
        console.error('Issue missing fields:', issue);
        return null;
      }

      return {
      id: issue.id,
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description,
      status: issue.fields.status?.name || null,
      assignee: issue.fields.assignee?.displayName || null,
      reporter: issue.fields.reporter?.displayName || null,
      priority: issue.fields.priority?.name || null,
      issueType: issue.fields.issuetype?.name || null,
      dueDate: issue.fields.duedate || null,
      startDate: issue.fields.created,
      createdDate: issue.fields.created,
      updatedDate: issue.fields.updated,
      estimatedHours: issue.fields.timetracking?.originalEstimateSeconds
        ? issue.fields.timetracking.originalEstimateSeconds / 3600
        : null,
      remainingHours: issue.fields.timetracking?.remainingEstimateSeconds
        ? issue.fields.timetracking.remainingEstimateSeconds / 3600
        : null,
      parentKey: issue.fields.parent?.key || null,
      labels: issue.fields.labels || [],
      components: issue.fields.components?.map(c => c.name) || [],
      resolution: issue.fields.resolution?.name || null,
      epic: issue.fields.customfield_10014 || null,
      sprint: issue.fields.customfield_10020?.[0]?.name || null,
      subtasks: issue.fields.subtasks?.map(subtask => ({
        id: subtask.id,
        key: subtask.key,
        summary: subtask.fields?.summary || '',
        status: subtask.fields?.status?.name || '',
        issueType: subtask.fields?.issuetype?.name || '',
      })) || [],
      };
    }).filter(issue => issue !== null) || [];

    res.json({
      success: true,
      issues,
      // DEBUG: Return raw first issue for inspection
      debug: {
        rawFirstIssue: response.issues?.[0] || null,
        rawFieldsCount: response.issues?.[0]?.fields ? Object.keys(response.issues[0].fields).length : 0,
        rawFieldNames: response.issues?.[0]?.fields ? Object.keys(response.issues[0].fields) : [],
      },
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
