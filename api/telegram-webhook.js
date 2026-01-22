import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import { Version3Client } from 'jira.js';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const config = {
    maxDuration: 60, // Extend timeout for AI/Jira fetch
};

// --- Setup ---
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Or SERVICE_ROLE_KEY if RLS is strict

if (!telegramToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is missing');
}

const bot = new Telegraf(telegramToken);
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Helpers ---

// Get user settings from DB
async function getUserSettings(telegramId) {
    const { data, error } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

    if (error || !data) return null;
    return data;
}

// Save user settings
async function saveUserSettings(telegramId, updates) {
    // Check if exists first (upsert)
    const { error } = await supabase
        .from('telegram_users')
        .upsert({ telegram_id: telegramId, ...updates }, { onConflict: 'telegram_id' });

    if (error) throw new Error(error.message);
}

// --- Commands ---

bot.start((ctx) => {
    ctx.reply(
        "Welcome to the Jira AI Bot! 🤖\n\n" +
        "I can summarize Jira issues for you using specific credentials.\n\n" +
        "Please run /setup to configure your access."
    );
});

// Setup Flow
// Note: In a real production bot, we'd use Scenes (telegraf-scenes). 
// For this MVP, we will use a simple format: /setup host email token ai_key
bot.command('setup', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);

    if (args.length !== 4) {
        return ctx.reply(
            "⚠️ usage: /setup <host> <email> <jira_token> <gemini_key>\n\n" +
            "Example:\n" +
            "/setup mycompany.atlassian.net me@email.com ATATT3... AIzaSy..."
        );
    }

    const [host, email, token, geminiKey] = args;

    try {
        await saveUserSettings(ctx.from.id, {
            jira_host: host,
            jira_email: email,
            jira_token: token,
            gemini_key: geminiKey
        });
        ctx.reply("✅ Credentials saved! You can now send me issue keys like 'PROJ-123'.");
    } catch (e) {
        console.error('Setup error:', e);
        ctx.reply("❌ Failed to save credentials. Database error.");
    }
});

bot.command('reset', async (ctx) => {
    await supabase.from('telegram_users').delete().eq('telegram_id', ctx.from.id);
    ctx.reply("🗑 Credentials verified removed.");
});

// Issue Handler
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();
    // Regex for Issue Key (e.g. ABC-123)
    const issueKeyMatch = text.match(/^[A-Z][A-Z0-9]+-\d+$/i);

    if (!issueKeyMatch) {
        // If not a command and not an issue key, ignore or help
        if (!text.startsWith('/')) {
            return ctx.reply("Please send a valid Jira Issue Key (e.g., TEAM-123).");
        }
        return;
    }

    const issueKey = issueKeyMatch[0].toUpperCase();
    const user = await getUserSettings(ctx.from.id);

    if (!user) {
        return ctx.reply("⚠️ You are not set up. Please run /setup first.");
    }

    try {
        ctx.sendChatAction('typing');

        // 1. Fetch from Jira
        const jira = new Version3Client({
            host: `https://${user.jira_host}`,
            authentication: {
                basic: {
                    email: user.jira_email,
                    apiToken: user.jira_token,
                },
            },
        });

        const issue = await jira.issues.getIssue({ issueIdOrKey: issueKey });

        // 2. Prepare Context for AI
        const summary = issue.fields.summary;
        const status = issue.fields.status.name;
        const assignee = issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned';
        const description = issue.fields.description || 'No description provided.';

        // Get generic comments (last 3)
        const comments = (issue.fields.comment?.comments || [])
            .slice(-3)
            .map(c => `- ${c.author.displayName}: ${c.body}`)
            .join('\n');

        const context = `
            Task: ${issueKey}
            Summary: ${summary}
            Status: ${status}
            Assignee: ${assignee}
            Description: ${JSON.stringify(description).substring(0, 500)}...
            Recent Comments:
            ${comments}
        `;

        // 3. AI Analysis
        // Create Google provider instance with user's key
        const google = createGoogleGenerativeAI({ apiKey: user.gemini_key });

        const { text: aiResponse } = await generateText({
            model: google('gemini-1.5-flash'), // Or generic model ID
            prompt: `
                You are a helpful project manager assistant.
                Analyze this Jira issue status and give a concise summary (max 3 sentences).
                Highlight any blockers or if it seems stuck.
                
                Data:
                ${context}
            `
        });

        ctx.reply(aiResponse);

    } catch (e) {
        console.error('Bot Error:', e);
        if (e?.response?.status === 401 || e?.response?.status === 403) {
            ctx.reply("❌ Jira Authentication failed. Please check your credentials with /setup.");
        } else if (e?.response?.status === 404) {
            ctx.reply(`❌ Issue ${issueKey} not found.`);
        } else {
            ctx.reply("❌ Error processing request: " + (e.message || 'Unknown error'));
        }
    }
});


// --- Vercel Webhook Handler ---
export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } catch (e) {
            console.error('Webhook processing error:', e);
            res.status(500).json({ error: 'Failed to process update' });
        }
    } else {
        res.status(200).send('Jira Bot Webhook Active');
    }
}
