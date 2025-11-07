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
        'reporter',
        'priority',
        'issuetype',
        'duedate',
        'created',
        'updated',
        'parent',
        'labels',
        'subtasks',
        'components',
        'resolution',
        'timetracking',
        'timeestimate',
        'timeoriginalestimate',
        'customfield_10014', // Epic Link (может отличаться)
        'customfield_10020', // Sprint (может отличаться)
      ],
    });

    // DEBUG: Log first issue raw from JIRA
    if (response.issues && response.issues.length > 0) {
      console.log('===== RAW JIRA RESPONSE (first issue) =====');
      console.log('ID:', response.issues[0].id);
      console.log('Key:', response.issues[0].key);
      console.log('Fields:', Object.keys(response.issues[0].fields));
      console.log('assignee:', response.issues[0].fields.assignee);
      console.log('reporter:', response.issues[0].fields.reporter);
      console.log('components:', response.issues[0].fields.components);
      console.log('customfield_10014 (epic):', response.issues[0].fields.customfield_10014);
      console.log('customfield_10020 (sprint):', response.issues[0].fields.customfield_10020);
      console.log('timeoriginalestimate:', response.issues[0].fields.timeoriginalestimate);
      console.log('==========================================');
    }

    const issues = response.issues?.map(issue => {
      const mapped = {
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName || null,
        reporter: issue.fields.reporter?.displayName || null,
        priority: issue.fields.priority?.name || null,
        issueType: issue.fields.issuetype.name,
        dueDate: issue.fields.duedate,
        startDate: issue.fields.created,
        createdDate: issue.fields.created,
        updatedDate: issue.fields.updated,
        estimatedHours: issue.fields.timeoriginalestimate ? issue.fields.timeoriginalestimate / 3600 : null,
        remainingHours: issue.fields.timeestimate ? issue.fields.timeestimate / 3600 : null,
        parentKey: issue.fields.parent?.key,
        labels: issue.fields.labels || [],
        components: issue.fields.components?.map(c => c.name) || [],
        resolution: issue.fields.resolution?.name || null,
        epic: issue.fields.customfield_10014 || null,
        sprint: issue.fields.customfield_10020?.[0]?.name || null,
        subtasks: issue.fields.subtasks?.map(subtask => ({
          id: subtask.id,
          key: subtask.key,
          summary: subtask.fields.summary,
          status: subtask.fields.status.name,
          issueType: subtask.fields.issuetype.name,
        })) || [],
      };

      // DEBUG: Log first mapped issue
      if (issue.key === response.issues[0].key) {
        console.log('===== MAPPED ISSUE (being returned) =====');
        console.log(JSON.stringify(mapped, null, 2));
        console.log('=========================================');
      }

      return mapped;
    }) || [];

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
