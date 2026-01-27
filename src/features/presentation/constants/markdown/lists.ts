export const lists = {
    unordered: {
        syntax: `- Первый пункт\n- Второй пункт\n- Третий пункт`,
        description: 'Маркированный список. Можно использовать - или *',
        example: `- React\n- Vue\n- Angular`,
    },
    ordered: {
        syntax: `1. Первый шаг\n2. Второй шаг\n3. Третий шаг`,
        description: 'Нумерованный список.',
        example: `1. Установить Node.js\n2. Запустить npm install\n3. Запустить npm run dev`,
    },
    nested: {
        syntax: `- Основной пункт\n  - Вложенный пункт\n    - Ещё глубже\n  - Второй вложенный`,
        description: 'Вложенные списки (2 пробела для вложения).',
        example: `- Frontend\n  - React\n    - Next.js\n    - Remix\n  - Vue\n- Backend\n  - Node.js\n  - Python`,
    },
    taskList: {
        syntax: `- [ ] Не выполнено\n- [x] Выполнено\n- [ ] Ещё задача`,
        description: 'Список задач с чекбоксами.',
        example: `- [x] Создать проект\n- [x] Настроить ESLint\n- [ ] Написать тесты\n- [ ] Деплой`,
    },
}
