
function normalizeUrl(baseUrl: string | undefined, defaultPath: string): string | undefined {
    if (!baseUrl) return undefined
    if (baseUrl.endsWith(defaultPath)) return baseUrl
    return `${baseUrl.replace(/\/$/, '')}${defaultPath}`
}

const tests = [
    { input: 'https://api.openai.com/v1', path: '/chat/completions', expected: 'https://api.openai.com/v1/chat/completions' },
    { input: 'https://api.openai.com/v1/', path: '/chat/completions', expected: 'https://api.openai.com/v1/chat/completions' },
    { input: 'https://api.deepseek.com', path: '/chat/completions', expected: 'https://api.deepseek.com/chat/completions' },
    { input: 'https://api.anthropic.com/v1/messages', path: '/messages', expected: 'https://api.anthropic.com/v1/messages' },
    { input: '', path: '/chat/completions', expected: undefined },
];

let failed = false;
tests.forEach(t => {
    const result = normalizeUrl(t.input || undefined, t.path);
    if (result !== t.expected) {
        console.error(`FAILED: Input "${t.input}" -> Expected "${t.expected}", got "${result}"`);
        failed = true;
    } else {
        console.log(`PASS: "${t.input}" -> "${result}"`);
    }
});

if (!failed) console.log('All tests passed');
