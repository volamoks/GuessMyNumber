
import { z } from 'zod';

const AIConfigSchema = z.object({
    provider: z.enum(['claude', 'gemini', 'openrouter', 'openai', 'deepseek']),
    apiKey: z.string().min(1, 'API key is required'),
    model: z.string().optional(),
    baseUrl: z.union([z.string().url(), z.literal('')]).optional(),
});

const config = {
    provider: 'claude',
    apiKey: 'test-key',
    model: 'test-model',
    baseUrl: '',
};

const result = AIConfigSchema.safeParse(config);
console.log('Success:', result.success);
if (!result.success) {
    console.log('Error:', JSON.stringify(result.error, null, 2));
}
