export const textFormatting = {
    bold: {
        syntax: '**жирный текст** или __жирный текст__',
        description: 'Выделение важной информации.',
        example: '**Важно:** Обратите внимание',
    },
    italic: {
        syntax: '*курсив* или _курсив_',
        description: 'Акцент или термин.',
        example: '*термин* означает...',
    },
    boldItalic: {
        syntax: '***жирный курсив***',
        description: 'Очень сильное выделение.',
        example: '***Критически важно!***',
    },
    strikethrough: {
        syntax: '~~зачёркнутый~~',
        description: 'Удалённый или устаревший текст.',
        example: '~~старая цена~~ новая цена',
    },
    code: {
        syntax: '`код`',
        description: 'Inline код. Красный цвет, серый фон.',
        example: 'Используйте функцию `useState()`',
    },
    highlight: {
        syntax: '<mark>выделенный</mark>',
        description: 'Жёлтый маркер.',
        example: '<mark>Запомнить!</mark>',
    },
}
