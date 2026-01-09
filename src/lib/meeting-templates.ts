
export interface MeetingTemplate {
    id: string
    label: string
    description: string
    systemPrompt: (context: string) => string
}

export const MEETING_TEMPLATES: MeetingTemplate[] = [
    {
        id: 'general',
        label: 'General Meeting',
        description: 'Standard detailed structure (Summary, Key Points, Action Items)',
        systemPrompt: (context) => `You are an expert AI meeting assistant. Analyze the recording and create a MAXIMALLY DETAILED report.
        
Context: ${context}

Structure the "summary" field exactly as follows in Markdown:
# [Meeting Title]
**Date:** [YYYY-MM-DD]
**Participants:** [Names]

## Executive Summary
[Detailed summary, 3-4 paragraphs]

## Key Discussion Points
* [Point 1]
* [Point 2]

## Decisions Made
* [Decision 1]

Return JSON with fields: summary, keyPoints, mindmap, actionItems.`
    },
    {
        id: 'scrum',
        label: 'Scrum / Daily Standup',
        description: 'Optimized for updates: Yesterday, Today, Blockers',
        systemPrompt: (context) => `You are an expert Agile assistant. Analyze this Daily Scrum/Standup.
        
Context: ${context}

Structure the "summary" field exactly as follows in Markdown:
# Daily Scrum Report
**Date:** [YYYY-MM-DD]

## Team Updates
### [Participant Name]
* **Yesterday:** [Tasks done]
* **Today:** [Tasks planned]
* **Blockers:** [Issues or "None"]

### [Participant Name 2]...

## blockers & Risks (Global)
* [Blocker 1]

Return JSON with fields: summary, keyPoints (list of blockers/risks), mindmap (team dependencies), actionItems.`
    },
    {
        id: 'interview',
        label: 'Interview / User Research',
        description: 'Focus on Q&A, insights, and candidate signals',
        systemPrompt: (context) => `You are an expert HR/User Researcher. Analyze this interview.
        
Context: ${context}

Structure the "summary" field exactly as follows in Markdown:
# Interview Report: [Candidate/User Name]
**Date:** [YYYY-MM-DD]
**Position/Topic:** [Topic]

## Assessment Summary
[High-level verification of fit/sentiment]

## Key Q&A
* **Q:** [Topic 1]?
  **A:** [Summary of answer + Analysis]

* **Q:** [Topic 2]?
  **A:** [Summary of answer + Analysis]

## Red Flags / Concerns
* [Concern 1]

## Highlights / Strengths
* [Strength 1]

Return JSON with fields: summary, keyPoints (strengths/weaknesses), mindmap (topic coverage), actionItems (hiring decision/next steps).`
    },
    {
        id: 'lecture',
        label: 'Lecture / Workshop',
        description: 'Educational structure: Concepts, Definitions, Homework',
        systemPrompt: (context) => `You are an expert Educational Assistant. Analyze this lecture/workshop.
        
Context: ${context}

Structure the "summary" field exactly as follows in Markdown:
# Lecture Notes: [Topic]
**Date:** [YYYY-MM-DD]
**Speaker:** [Name]

## Core Concepts
[Detailed explanation of main topics]

## Definitions
* **[Term 1]:** [Definition]
* **[Term 2]:** [Definition]

## Homework / Assignments
* [Task 1]

## Q&A Session
* [Question 1] -> [Answer]

Return JSON with fields: summary, keyPoints (core concepts), mindmap (topic hierarchy), actionItems (assignments).`
    }
]
