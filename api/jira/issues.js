import { Version3Client } from 'jira.js';

function createJiraClient(config) {
  // Use Version3Client for JIRA Cloud (*.atlassian.net)
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

    // Use new Enhanced Search API (required by JIRA Cloud as of 2024)
    console.log('Making JIRA Cloud API request...');
    console.log('JQL:', query);
    console.log('Max results:', maxResults);

    let response;
    try {
      response = await client.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
        jql: query,
        maxResults,
        // Omit fields parameter to get all fields
        // Enhanced Search returns all fields by default
      });
      console.log('JIRA API request completed successfully');
      console.log('Response has issues?', !!response.issues);
      console.log('Issues count:', response.issues?.length || 0);
    } catch (apiError) {
      console.error('JIRA API call failed:', apiError);
      throw apiError;
    }

    // DEBUG: Log first issue raw from JIRA
    if (response.issues && response.issues.length > 0) {
      console.log('===== RAW JIRA RESPONSE (first issue) =====');
      console.log('ID:', response.issues[0].id);
      console.log('Key:', response.issues[0].key);
      console.log('Total fields count:', Object.keys(response.issues[0].fields).length);
      console.log('All field names:', Object.keys(response.issues[0].fields).join(', '));
      console.log('\n--- Standard fields ---');
      console.log('assignee:', JSON.stringify(response.issues[0].fields.assignee, null, 2));
      console.log('reporter:', JSON.stringify(response.issues[0].fields.reporter, null, 2));
      console.log('components:', JSON.stringify(response.issues[0].fields.components, null, 2));
      console.log('timetracking:', JSON.stringify(response.issues[0].fields.timetracking, null, 2));
      console.log('resolution:', JSON.stringify(response.issues[0].fields.resolution, null, 2));
      console.log('parent:', JSON.stringify(response.issues[0].fields.parent, null, 2));
      console.log('labels:', JSON.stringify(response.issues[0].fields.labels, null, 2));
      console.log('\n--- Custom fields ---');
      console.log('customfield_10014 (epic):', JSON.stringify(response.issues[0].fields.customfield_10014, null, 2));
      console.log('customfield_10020 (sprint):', JSON.stringify(response.issues[0].fields.customfield_10020, null, 2));
      console.log('==========================================');
    }

    const issues = response.issues?.map(issue => {
      // DEBUG components specifically
      const componentsRaw = issue.fields.components;
      const componentsMapped = componentsRaw?.map(c => c.name) || [];
      if (issue.key === response.issues[0].key) {
        console.log('===== COMPONENTS DEBUG =====');
        console.log('Raw components:', JSON.stringify(componentsRaw, null, 2));
        console.log('Mapped components:', componentsMapped);
        console.log('============================');
      }

      const mapped = {
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
        // timetracking is an object with nested fields
        estimatedHours: issue.fields.timetracking?.originalEstimateSeconds
          ? issue.fields.timetracking.originalEstimateSeconds / 3600
          : null,
        remainingHours: issue.fields.timetracking?.remainingEstimateSeconds
          ? issue.fields.timetracking.remainingEstimateSeconds / 3600
          : null,
        parentKey: issue.fields.parent?.key || null,
        labels: issue.fields.labels || [],
        components: componentsMapped,
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

      // DEBUG: Log first mapped issue
      if (issue.key === response.issues[0].key) {
        console.log('===== MAPPED ISSUE (being returned) =====');
        console.log(JSON.stringify(mapped, null, 2));
        console.log('=========================================');
      }

      return mapped;
    }) || [];

    const debugInfo = {
      rawFirstIssue: response.issues?.[0] || null,
      rawFieldsCount: response.issues?.[0] ? Object.keys(response.issues[0].fields).length : 0,
      rawFieldNames: response.issues?.[0] ? Object.keys(response.issues[0].fields) : [],
    };

    console.log('===== SENDING RESPONSE =====');
    console.log('Issues count:', issues.length);
    console.log('Debug info fields count:', debugInfo.rawFieldsCount);
    console.log('============================');

    res.json({
      success: true,
      issues,
      // DEBUG: Return raw first issue for inspection
      debug: debugInfo,
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
