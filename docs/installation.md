# Установка Project Agent Factory из GitHub для Codex и Claude Code

В этом руководстве описано, как установить скачанную копию Project Agent Factory в качестве
локального плагина Codex или Claude Code и выполнить первую инициализацию проекта. Исходный код
находится в репозитории <https://github.com/jjuchara/project-agent-factory>.

## Требования

- Codex CLI с поддержкой плагинов и/или Claude Code с поддержкой `claude plugin`.
- Node.js 20 или новее.
- Локальный клон репозитория или распакованный архив.

Проверьте наличие необходимых команд:

```bash
codex --version
claude --version
node --version
```

У Factory нет зависимостей из npm, поэтому выполнять `npm install` не требуется. Перед установкой
можно проверить скачанную копию репозитория:

```bash
cd /absolute/path/to/project-agent-factory
npm test
npm run validate
npm run validate:claude
```

## Вариант A: установите Factory в Codex

### 1. Создайте обёртку локального marketplace Codex

Репозиторий Factory содержит плагин, но сам не является отдельным marketplace. Поэтому следует
создать для него небольшой локальный marketplace, а не передавать путь к репозиторию Factory
непосредственно в команду `codex plugin marketplace add`.

Выберите абсолютный путь для marketplace и создайте необходимые каталоги. В примере ниже
предполагается, что репозиторий скачан в
`/Users/alex/Downloads/project-agent-factory`:

```bash
mkdir -p /Users/alex/CodexMarketplaces/paf-local/.agents/plugins
mkdir -p /Users/alex/CodexMarketplaces/paf-local/plugins
ln -s /Users/alex/Downloads/project-agent-factory \
  /Users/alex/CodexMarketplaces/paf-local/plugins/project-agent-factory
```

Замените `/Users/alex/Downloads/project-agent-factory` реальным абсолютным путём к скачанному
репозиторию. Вместо создания символической ссылки можно переместить или клонировать репозиторий
прямо в каталог marketplace `plugins/project-agent-factory`.

Создайте файл
`/Users/alex/CodexMarketplaces/paf-local/.agents/plugins/marketplace.json` со следующим содержимым:

```json
{
  "name": "paf-local",
  "interface": {
    "displayName": "Project Agent Factory Local"
  },
  "plugins": [
    {
      "name": "project-agent-factory",
      "source": {
        "source": "local",
        "path": "./plugins/project-agent-factory"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

Имя marketplace `paf-local` приведено для примера. Если вы измените поле `name` в JSON-файле,
используйте это же имя в селекторе плагина на следующем этапе.

### 2. Зарегистрируйте marketplace и установите Factory

Следующие команды изменяют пользовательскую конфигурацию Codex. Выполняйте их только после
проверки пути к локальному marketplace и источника плагина:

```bash
codex plugin marketplace add /Users/alex/CodexMarketplaces/paf-local
codex plugin add project-agent-factory@paf-local
```

Убедитесь, что marketplace зарегистрирован, а плагин установлен и включён:

```bash
codex plugin marketplace list --json
codex plugin list --json
```

В списке установленных плагинов должен находиться `project-agent-factory@paf-local` со значениями
`true` в полях `installed` и `enabled`. После установки перезапустите Codex или откройте новый
сеанс Codex.

## Вариант B: установите Factory в Claude Code

Репозиторий уже содержит Claude marketplace в `.claude-plugin/marketplace.json`, поэтому отдельная
обёртка не нужна. Сначала проверьте plugin и marketplace, затем явно зарегистрируйте локальный
источник и установите Factory:

```bash
cd /absolute/path/to/project-agent-factory
claude plugin validate . --strict
claude plugin validate .claude-plugin/plugin.json --strict
claude plugin marketplace add /absolute/path/to/project-agent-factory
claude plugin install project-agent-factory@project-agent-factory
```

Последние две команды изменяют пользовательскую конфигурацию Claude Code и требуют отдельного
подтверждения. Проверьте результат:

```bash
claude plugin marketplace list --json
claude plugin list --json
```

В списке должен находиться включённый `project-agent-factory@project-agent-factory`. Откройте новый
сеанс Claude Code, чтобы загрузить навыки Factory.

## 3. Откройте целевой проект

Откройте в Codex или Claude Code каталог проекта, для которого нужно создать собственный набор
агентов. Это может быть репозиторий программного обеспечения, исследовательская или
документационная рабочая область, юридический, аудиторский, продуктовый, операционный или
смешанный проект.

В обычном сценарии первоначальной настройки не запускайте генератор вручную с флагом `--write`.
В новом чате выберите установленный навык инициализации. В Codex он может отображаться под одним
из следующих имён:

```text
project-agent-factory:project-agents-init
```

или:

```text
project-agents-init
```

В Claude Code используйте namespaced skill:

```text
/project-agent-factory:project-agents-init
```

Также можно сформулировать запрос обычным текстом, например:

```text
Инициализируй Project Agent Factory для этого проекта.
```

Если документация распределена по нескольким каталогам, содержит много файлов или не имеет
очевидной точки входа, перед инициализацией вызовите `project-docs-prepare` (в Claude Code —
`/project-agent-factory:project-docs-prepare`). Навык построит read-only карту структуры, ссылок,
точных дубликатов, возможных orphan-документов и маршрутов чтения. Он не назначает документам
canonical authority и не изменяет файлы без отдельного preview и подтверждения.

## 4. Проверьте и утвердите blueprint проекта

Сначала навык инициализации работает только в режиме чтения. Он изучает лишь те материалы, которые
нужны для понимания проекта, задаёт вопросы о недостающих сведениях и предлагает указать
каноническую документацию.

После этого навык показывает карточку проекта с указанием источников и blueprint генерации. В него
входят предлагаемые агенты, workflow, разрешения, правила проверки, создаваемые пути, конфликты и
нерешённые вопросы. Проверьте этот предварительный план перед утверждением.

Утверждение blueprint разрешает только создание файлов проектного набора. Оно не разрешает
настройку MCP, доверие lifecycle hooks, установку плагина, принудительную замену изменённых
managed-файлов или другие несвязанные записи.

## 5. Создайте и при необходимости установите проектные плагины

После утверждения Factory выполняет dry-run перед записью набора `.projectAgents`. Существующее
содержимое `AGENTS.md` объединяется с новым только после явного подтверждения, а изменённые
managed-файлы не перезаписываются без предупреждения.

Генерация создаёт два автономных project plugins, но не устанавливает ни один автоматически. Codex
и Claude Code являются разными границами записи: разрешение на одну платформу не распространяется
на другую.

После просмотра generated hook и отдельного подтверждения для нужной платформы выполните:

```bash
# Codex
node .projectAgents/scripts/project-plugin-init.mjs --check
node .projectAgents/scripts/project-plugin-init.mjs

# Claude Code: local project scope
node .projectAgents/scripts/claude-plugin-init.mjs --check
node .projectAgents/scripts/claude-plugin-init.mjs
```

После успешной установки проектного плагина:

1. Изучите lifecycle hooks проекта и доверяйте им, только если их содержимое приемлемо.
2. Откройте новый чат Codex или новый сеанс Claude Code в целевом проекте.
3. Выполните `<project-slug>-help` и `<project-slug>-status` в качестве первоначальной smoke-проверки.
   Например, для проекта со slug `tflex-macros` это `tflex-macros-help` и
   `tflex-macros-status`.

## Решение проблем

- **Плагин отсутствует в списке:** проверьте, что путь в `marketplace.json` ведёт к каталогу,
  содержащему `.codex-plugin/plugin.json`.
- **Имя marketplace отличается:** после символа `@` в селекторе плагина укажите точное значение
  поля `name` из `marketplace.json`.
- **Навык инициализации отсутствует:** убедитесь, что плагин включён, затем перезапустите Codex или
  Claude Code либо откройте новый сеанс.
- **Claude marketplace не проходит validation:** запустите отдельно
  `claude plugin validate . --strict` для marketplace и
  `claude plugin validate .claude-plugin/plugin.json --strict` для manifest Factory.
- **Node.js не может запустить Factory:** установите Node.js 20 или новее и снова выполните
  `node --version`.
- **В целевом проекте уже есть `AGENTS.md` или `.projectAgents`:** не удаляйте их. Позвольте навыку
  инициализации или обновления показать конфликты и запросить необходимые подтверждения.
