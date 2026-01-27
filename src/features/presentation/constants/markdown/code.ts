export const code = {
    inline: {
        syntax: '`код в строке`',
        description: 'Короткий код в тексте.',
        example: 'Установите `pnpm` командой `npm i -g pnpm`',
    },
    block: {
        syntax: `\`\`\`javascript\nconst greeting = "Hello";\nconsole.log(greeting);\n\`\`\``,
        description: 'Блок кода с указанием языка. Тёмный фон.',
        example: `\`\`\`typescript\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nconst fetchUser = async (id: number): Promise<User> => {\n  const response = await fetch(\\\`/api/users/\\\${id}\\\`);\n  return response.json();\n};\n\`\`\``,
    },
    languages: {
        description: 'Поддерживаемые языки для блоков кода:',
        list: [
            'javascript', 'typescript', 'jsx', 'tsx',
            'python', 'java', 'csharp', 'cpp',
            'html', 'css', 'scss', 'json',
            'sql', 'bash', 'shell', 'yaml',
            'markdown', 'xml', 'graphql', 'rust',
        ],
    },
}
