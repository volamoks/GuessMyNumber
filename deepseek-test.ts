
async function testEndpoint(url: string) {
    console.log(`Testing ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer test-key',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'hi' }]
            })
        });
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response: ${text}`);
    } catch (e) {
        console.error(`Error: ${e}`);
    }
}

async function run() {
    await testEndpoint('https://api.deepseek.com/chat/completions');
    await testEndpoint('https://api.deepseek.com/v1/chat/completions');
}

run();
