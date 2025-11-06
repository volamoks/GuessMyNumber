# JIRA-Gantt Integration Setup

This guide explains how to run the JIRA-Gantt feature with the backend proxy server.

## Architecture

```
Frontend (React)  →  Backend Proxy (Express)  →  JIRA API
   Port 5174            Port 3001                 atlassian.net
```

**Why a backend proxy?**
- JIRA API doesn't allow direct browser requests (CORS)
- API tokens should not be exposed in frontend code
- Backend provides secure intermediary

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
cd app
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server will start on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd app
npm run dev
```
App will start on `http://localhost:5174`

### 3. Configure JIRA Credentials

**Create `.env.local` file:**
```bash
cd app
cp .env.example .env.local
```

**Edit `app/.env.local` with your JIRA credentials:**
```bash
VITE_JIRA_HOST=https://ucmg.atlassian.net
VITE_JIRA_EMAIL=your-email@uzcard.uz
VITE_JIRA_API_TOKEN=ATATT3xFfGF0jhqp...
```

**Generate API token:** https://id.atlassian.com/manage-profile/security/api-tokens

⚠️ **Security:** `.env.local` is in `.gitignore` - your credentials will NOT be committed to Git!

### 4. Use the JIRA-Gantt Feature

1. Open `http://localhost:5174` in your browser
2. Navigate to **JIRA Gantt** in the menu
3. Connection will happen **automatically** using `.env.local` credentials
4. Select a project and click **Sync Tasks**
5. View and interact with your Gantt chart!

## Features

✅ Connect to JIRA with API token
✅ Browse JIRA projects
✅ Sync tasks from selected project
✅ Interactive Gantt chart visualization
✅ Drag-and-drop task rescheduling
✅ 2-way sync (changes push back to JIRA)
✅ Export to JSON/PDF

## API Endpoints

The backend proxy provides these endpoints:

- `POST /api/jira/connect` - Test JIRA connection
- `POST /api/jira/projects` - Get all projects
- `POST /api/jira/issues` - Fetch issues from project
- `POST /api/jira/update-issue` - Update issue (for 2-way sync)

See `server/README.md` for detailed API documentation.

## Troubleshooting

### Error: "Cannot connect to localhost:3001"
Make sure the backend server is running in a separate terminal:
```bash
cd server
npm run dev
```

### Error: "CORS"
The backend server should automatically allow requests from `localhost:5174`. If you're running on a different port, update `server/server.js`.

### Error: "401 Unauthorized"
Check your JIRA credentials:
- Host should include `https://` (e.g., `https://your-domain.atlassian.net`)
- API token should be fresh (they expire)
- Email should match your JIRA account

## Production Deployment

For production:

1. **Environment Variables**: Use `.env` files for configuration
2. **Authentication**: Implement proper session management
3. **Database**: Store credentials encrypted in database
4. **Caching**: Use Redis for better performance
5. **Security**: Add rate limiting and request validation

Example production setup:
- Deploy frontend to Vercel/Netlify
- Deploy backend to Railway/Render/Heroku
- Update `VITE_JIRA_PROXY_URL` env variable to point to production backend

## Development Scripts

**Run both servers concurrently:**
```bash
# Install concurrently globally
npm install -g concurrently

# From project root
concurrently "cd server && npm run dev" "cd app && npm run dev"
```

Or add this to root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"cd server && npm run dev\" \"cd app && npm run dev\""
  }
}
```

## Next Steps

Want to add AI features? See `PHASE_2_AI.md` for:
- AI-powered translation
- Smart scheduling
- Natural language queries
- Risk analysis
- Meeting notes → tasks conversion
