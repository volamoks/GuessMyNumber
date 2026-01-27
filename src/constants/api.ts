export const API_ENDPOINTS = {
    JIRA: {
        BASE: '/api/jira',
        CONNECT: '/api/jira/connect',
        ISSUES: '/api/jira/issues',
        PROJECTS: '/api/jira/projects',
        UPDATE_ISSUE: '/api/jira/update-issue',
    },
    TRANSCRIPTION: {
        UPLOAD: '/api/transcribe',
        STATUS: (id: string) => `/api/transcribe/${id}`,
    },
} as const
