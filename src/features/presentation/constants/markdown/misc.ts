export const blockquotes = {
    simple: {
        syntax: `> Это цитата.\n> Она может быть многострочной.`,
        description: 'Цитата с фиолетовой левой полосой и серым фоном.',
        example: `> "Любая достаточно продвинутая технология\n> неотличима от магии."\n> — Артур Кларк`,
    },
    nested: {
        syntax: `> Внешняя цитата\n>> Вложенная цитата`,
        description: 'Вложенные цитаты.',
        example: `> Пользователь спросил:\n>> Как установить React?\n> Ответ: npm create vite@latest`,
    },
}

export const links = {
    inline: {
        syntax: '[текст ссылки](URL)',
        description: 'Ссылка с фиолетовым цветом и подчёркиванием.',
        example: '[React Documentation](https://react.dev)',
    },
    withTitle: {
        syntax: '[текст](URL "заголовок")',
        description: 'Ссылка с всплывающей подсказкой.',
        example: '[GitHub](https://github.com "Перейти на GitHub")',
    },
    image: {
        syntax: '![alt текст](URL изображения)',
        description: 'Изображение с рамкой и скруглёнными углами.',
        example: '![Logo](./logo.png)',
    },
    imageWithLink: {
        syntax: '[![alt](image-url)](link-url)',
        description: 'Кликабельное изображение.',
        example: '[![React Logo](./react.png)](https://react.dev)',
    },
}

export const dividers = {
    horizontal: {
        syntax: '---  или  ***  или  ___',
        description: 'Горизонтальная линия для разделения секций.',
        example: `Первая секция\n\n---\n\nВторая секция`,
    },
}

export const advanced = {
    details: {
        syntax: `<details>\n<summary>Нажмите чтобы раскрыть</summary>\n\nСкрытый контент здесь...\n\n</details>`,
        description: 'Сворачиваемый блок (спойлер).',
        example: `<details>\n<summary>Показать решение</summary>\n\n\`\`\`javascript\nconst solution = 42;\n\`\`\`\n\n</details>`,
    },
    keyboard: {
        syntax: '<kbd>Ctrl</kbd> + <kbd>C</kbd>',
        description: 'Клавиша клавиатуры.',
        example: 'Нажмите <kbd>Ctrl</kbd> + <kbd>S</kbd> для сохранения',
    },
    footnote: {
        syntax: `Текст с сноской[^1].\n\n[^1]: Текст сноски.`,
        description: 'Сноска внизу документа.',
        example: `React[^1] — это библиотека для UI.\n\n[^1]: Создана Facebook в 2013 году.`,
    },
}
