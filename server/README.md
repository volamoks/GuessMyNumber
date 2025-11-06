# JIRA Proxy Server

Backend proxy server for JIRA API to avoid CORS issues and secure API token handling.

## Setup

```bash
cd server
npm install
```

## Running

```bash
npm run dev
```

Server will start on `http://localhost:3001`

## Why do we need this?

1. **CORS**: JIRA API doesn't allow direct browser requests
2. **Security**: API tokens shouldn't be exposed in frontend code
3. **Proxy**: This server acts as a secure proxy between your frontend and JIRA

## API Endpoints

### POST /api/jira/connect
Test JIRA connection

**Body:**
```json
{
  "host": "https://your-domain.atlassian.net",
  "email": "your-email@example.com",
  "apiToken": "your-api-token"
}
```

### POST /api/jira/projects
Get all JIRA projects

### POST /api/jira/issues
Fetch issues from a project

**Body:**
```json
{
  "host": "...",
  "email": "...",
  "apiToken": "...",
  "projectKey": "PROJ",
  "maxResults": 100
}
```

### POST /api/jira/update-issue
Update an issue

**Body:**
```json
{
  "host": "...",
  "email": "...",
  "apiToken": "...",
  "issueKey": "PROJ-123",
  "updates": {
    "dueDate": "2025-12-31",
    "startDate": "2025-11-01"
  }
}
```

## Production

For production, consider:
- Use environment variables for configuration
- Add authentication/session management
- Store JIRA credentials in encrypted database
- Use Redis for caching
- Add rate limiting
