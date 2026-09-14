# Подключение Project Agent Factory к конкретному проекту

Эта инструкция подключает сгенерированные команды, skills, agents и hooks только к одному
целевому репозиторию.

После настройки Codex читает:

- команды и skills из `<проект>/.agents/skills/`;
- agents из `<проект>/.codex/agents/`;
- hooks из `<проект>/.codex/hooks.json`;
- исполняемые hook-скрипты из `<проект>/.projectAgents/hooks/`.

Generated Codex adapter не нужно устанавливать командой `codex plugin add`: такая установка имеет
пользовательский scope и делает команды видимыми в других проектах. Сама Factory может оставаться
глобально установленной, потому что её задача — создавать и обновлять project-local наборы.

## Перед началом

Нужны:

- Node.js 20 или новее;
- локальный checkout Project Agent Factory;
- целевой Git-репозиторий;
- для существующего `.projectAgents` kit — файл `.projectAgents/project-profile.json`;
- для нового проекта — утверждённый blueprint JSON, созданный через `project-agents-init`.

Установка самой Factory описана отдельно в
[руководстве по установке Factory](docs/installation.md).

Ни одна из приведённых ниже команд не требует `npm install`.

## Windows PowerShell

### 1. Укажите пути и slug проекта

Измените только значения в кавычках, затем вставьте блок целиком в PowerShell:

```powershell
$FactoryRoot = (Resolve-Path "C:\Projects\project-agent-factory").Path
$ProjectRoot = (Resolve-Path "C:\Projects\my-project").Path
$ProjectSlug = "my-project"
$BlueprintPath = Join-Path $ProjectRoot ".projectAgents\project-profile.json"
$FactoryCli = Join-Path $FactoryRoot "scripts\project-agents.mjs"

node --version
codex --version
Test-Path $FactoryCli
Test-Path $BlueprintPath
```

Обе последние команды должны вывести `True`. Для нового проекта замените `$BlueprintPath` путём к
утверждённому blueprint JSON.

### 2. Просмотрите план без записи

```powershell
node $FactoryCli generate --root $ProjectRoot --blueprint $BlueprintPath
```

Проверьте `summary` и `conflicts`. Команда ничего не записывает. Если в новом проекте уже есть
`AGENTS.md`, после просмотра будущего merge повторите dry-run с явным разрешением:

```powershell
node $FactoryCli generate --root $ProjectRoot --blueprint $BlueprintPath --merge-agents
```

### 3. Примените подтверждённый план

Для существующего kit или проекта без конфликта `AGENTS.md`:

```powershell
node $FactoryCli generate --root $ProjectRoot --blueprint $BlueprintPath --write
```

Если dry-run требовал и вы отдельно подтвердили merge существующего `AGENTS.md`:

```powershell
node $FactoryCli generate --root $ProjectRoot --blueprint $BlueprintPath --merge-agents --write
```

Не используйте `--force-managed`, пока не просмотрен каждый перезаписываемый конфликтующий файл.

### 4. Проверьте локальные файлы

```powershell
node $FactoryCli validate-kit --root $ProjectRoot
Get-ChildItem (Join-Path $ProjectRoot ".agents\skills") -Recurse -Filter SKILL.md
Get-ChildItem (Join-Path $ProjectRoot ".codex\agents") -Filter *.toml
Get-Content (Join-Path $ProjectRoot ".codex\hooks.json")
```

`validate-kit` должен вернуть `"valid": true`.

### 5. При необходимости удалите старый глобальный Codex plugin

Сначала найдите точный ID и убедитесь, что локальные файлы из предыдущего шага уже созданы:

```powershell
codex plugin list --json
$LegacyPluginId = "$ProjectSlug-codex-plugin@$ProjectSlug"
$LegacyPluginId
```

Следующие команды меняют пользовательскую конфигурацию Codex. Выполняйте их только после проверки
точного ID и отдельного подтверждения удаления:

```powershell
codex plugin remove $LegacyPluginId
codex plugin marketplace list --json
codex plugin marketplace remove $ProjectSlug
```

Marketplace удаляйте только тогда, когда он не нужен другим плагинам. Не удаляйте глобальную
Factory: `project-agent-factory@<имя-marketplace>`.

### 6. Запустите Codex в целевом проекте

```powershell
Set-Location $ProjectRoot
codex
```

В новом сеансе откройте `/hooks`, просмотрите и доверьте project-local hooks. Затем вызовите
`$my-project-help` и `$my-project-status`, заменив `my-project` значением `$ProjectSlug`.

Для проверки изоляции завершите сеанс и запустите Codex из соседнего репозитория. Команды
`$my-project-*` там отображаться не должны.

## Linux

### 1. Укажите пути и slug проекта

Измените значения в первых трёх строках и вставьте блок в Bash:

```bash
FACTORY_ROOT="/home/user/projects/project-agent-factory"
PROJECT_ROOT="/home/user/projects/my-project"
PROJECT_SLUG="my-project"
BLUEPRINT_PATH="$PROJECT_ROOT/.projectAgents/project-profile.json"
FACTORY_CLI="$FACTORY_ROOT/scripts/project-agents.mjs"

node --version
codex --version
test -f "$FACTORY_CLI"
test -f "$BLUEPRINT_PATH"
```

Для нового проекта задайте `BLUEPRINT_PATH` как путь к утверждённому blueprint JSON.

### 2. Просмотрите план без записи

```bash
node "$FACTORY_CLI" generate --root "$PROJECT_ROOT" --blueprint "$BLUEPRINT_PATH"
```

Проверьте `summary` и `conflicts`. Команда ничего не записывает. Если новый проект уже содержит
`AGENTS.md`, после просмотра будущего merge повторите dry-run с `--merge-agents`.

### 3. Примените подтверждённый план

```bash
node "$FACTORY_CLI" generate --root "$PROJECT_ROOT" --blueprint "$BLUEPRINT_PATH" --write
```

Если dry-run требовал и вы отдельно подтвердили merge существующего `AGENTS.md`, добавьте
`--merge-agents` к команде записи. Не используйте `--force-managed`, пока не просмотрен каждый
перезаписываемый конфликтующий файл.

### 4. Проверьте локальные файлы

```bash
node "$FACTORY_CLI" validate-kit --root "$PROJECT_ROOT"
find "$PROJECT_ROOT/.agents/skills" -name SKILL.md -print
find "$PROJECT_ROOT/.codex/agents" -name '*.toml' -print
sed -n '1,240p' "$PROJECT_ROOT/.codex/hooks.json"
```

`validate-kit` должен вернуть `"valid": true`.

### 5. При необходимости удалите старый глобальный Codex plugin

```bash
codex plugin list --json
LEGACY_PLUGIN_ID="${PROJECT_SLUG}-codex-plugin@${PROJECT_SLUG}"
printf '%s\n' "$LEGACY_PLUGIN_ID"
```

После проверки точного ID и отдельного подтверждения удаления:

```bash
codex plugin remove "$LEGACY_PLUGIN_ID"
codex plugin marketplace list --json
codex plugin marketplace remove "$PROJECT_SLUG"
```

Marketplace удаляйте только при отсутствии других зависимых плагинов. Глобальную Factory не
удаляйте.

### 6. Запустите Codex и проверьте изоляцию

```bash
cd "$PROJECT_ROOT"
codex
```

В новом сеансе откройте `/hooks`, доверьте проверенные hooks и вызовите
`$my-project-help`/`$my-project-status` с фактическим slug. После этого откройте Codex из другого
репозитория и убедитесь, что `$my-project-*` там отсутствуют.

## macOS

### 1. Укажите пути и slug проекта

Измените значения в первых трёх строках и вставьте блок в Terminal:

```bash
FACTORY_ROOT="/Users/user/projects/project-agent-factory"
PROJECT_ROOT="/Users/user/projects/my-project"
PROJECT_SLUG="my-project"
BLUEPRINT_PATH="$PROJECT_ROOT/.projectAgents/project-profile.json"
FACTORY_CLI="$FACTORY_ROOT/scripts/project-agents.mjs"

node --version
codex --version
test -f "$FACTORY_CLI"
test -f "$BLUEPRINT_PATH"
```

Для нового проекта задайте `BLUEPRINT_PATH` как путь к утверждённому blueprint JSON.

### 2. Просмотрите план без записи

```bash
node "$FACTORY_CLI" generate --root "$PROJECT_ROOT" --blueprint "$BLUEPRINT_PATH"
```

Проверьте `summary` и `conflicts`. Команда ничего не записывает. Если новый проект уже содержит
`AGENTS.md`, после просмотра будущего merge повторите dry-run с `--merge-agents`.

### 3. Примените подтверждённый план

```bash
node "$FACTORY_CLI" generate --root "$PROJECT_ROOT" --blueprint "$BLUEPRINT_PATH" --write
```

Если dry-run требовал и вы отдельно подтвердили merge существующего `AGENTS.md`, добавьте
`--merge-agents` к команде записи. Не используйте `--force-managed`, пока не просмотрен каждый
перезаписываемый конфликтующий файл.

### 4. Проверьте локальные файлы

```bash
node "$FACTORY_CLI" validate-kit --root "$PROJECT_ROOT"
find "$PROJECT_ROOT/.agents/skills" -name SKILL.md -print
find "$PROJECT_ROOT/.codex/agents" -name '*.toml' -print
sed -n '1,240p' "$PROJECT_ROOT/.codex/hooks.json"
```

`validate-kit` должен вернуть `"valid": true`.

### 5. При необходимости удалите старый глобальный Codex plugin

```bash
codex plugin list --json
LEGACY_PLUGIN_ID="${PROJECT_SLUG}-codex-plugin@${PROJECT_SLUG}"
printf '%s\n' "$LEGACY_PLUGIN_ID"
```

После проверки точного ID и отдельного подтверждения удаления:

```bash
codex plugin remove "$LEGACY_PLUGIN_ID"
codex plugin marketplace list --json
codex plugin marketplace remove "$PROJECT_SLUG"
```

Marketplace удаляйте только при отсутствии других зависимых плагинов. Глобальную Factory не
удаляйте.

### 6. Запустите Codex и проверьте изоляцию

```bash
cd "$PROJECT_ROOT"
codex
```

В новом сеансе откройте `/hooks`, доверьте проверенные hooks и вызовите
`$my-project-help`/`$my-project-status` с фактическим slug. После этого откройте Codex из другого
репозитория и убедитесь, что `$my-project-*` там отсутствуют.

## Промпт для миграции старого репозитория

Замените два пути в начале промпта и отправьте его модели из корня репозитория, где уже существует
старый `.projectAgents` kit. Промпт подходит для Codex и Claude Code.

```text
Нужно безопасно мигрировать существующий Project Agent Factory kit на актуальную схему.

Factory root: <АБСОЛЮТНЫЙ_ПУТЬ_К_PROJECT_AGENT_FACTORY>
Target project root: <АБСОЛЮТНЫЙ_ПУТЬ_К_ЦЕЛЕВОМУ_РЕПОЗИТОРИЮ>

Используй workflow project-agents-update из указанного Factory root. Не повторяй полную
инициализацию проекта и не меняй файлы на первом этапе.

1. Прочитай AGENTS.md целевого проекта и правила Factory. Затем прочитай только необходимые
   .projectAgents/project-profile.json, generation-state.json и evidence/index.json.
2. Запусти validate-kit для текущего состояния и отдельно перечисли missing/modified managed files.
3. Используй существующий .projectAgents/project-profile.json как blueprint. Покажи dry-run команды
   generate без --write и полный итоговый план: create, update, preserve, delete, conflicts.
4. Подтверди, что seeded context, docs и memory сохраняются. Не используй --force-managed. Если
   изменённый stale managed-файл нельзя безопасно удалить, остановись и покажи конфликт.
5. Для Codex мигрируй generated capabilities в repository-local пути:
   .agents/skills, .codex/agents, .codex/hooks.json и .projectAgents/hooks. Не устанавливай
   generated Codex plugin. Старые managed marketplace/plugin/bootstrap файлы удаляй только через
   generation-state и только при совпадении SHA-256.
6. Проверь codex plugin list --json. Если старый generated Codex plugin всё ещё установлен на уровне
   пользователя, покажи его точный ID и marketplace, но не удаляй их без отдельного подтверждения.
7. Для Claude Code проверь generated Claude manifest, marketplace и bootstrap. Bootstrap --check
   должен выполняться с cwd, равным Target project root. Marketplace при необходимости добавляется
   с --scope local, а generated Claude plugin всегда устанавливается с --scope local.
8. Проверь claude plugin list --json. Найди все записи этого plugin ID вне local scope целевого
   проекта: user, project или local с другим projectPath. Покажи точный scope и projectPath. Не
   удаляй и не переустанавливай их без отдельного подтверждения для каждой внешней конфигурации.
9. После dry-run остановись и запроси подтверждение записи project files. Подтверждение записи не
   означает разрешение на установку Claude plugin или удаление legacy Codex/Claude installations.
10. После подтверждения примени только показанный план, запусти validate-kit и проверь созданные
    .agents/skills, .codex/agents, .codex/hooks.json и .projectAgents/hooks.
11. Если generated Claude content изменился, сначала выполни claude-plugin-init.mjs --check. Затем
    отдельно запроси подтверждение local-scope установки. После установки подтверди по
    claude plugin list --json, что plugin включён с scope=local для Target project root.
12. Для удаления legacy installations сначала покажи точные команды. Выполняй каждую только после
    отдельного явного подтверждения пользователя и обязательно указывай правильный --scope.
13. В финале раздели автоматические доказательства и ручные проверки. Попроси открыть новые сессии
    Codex и Claude Code внутри целевого проекта, проверить help/status и затем убедиться из другого
    репозитория, что project-команды, skills, agents и hooks там не загружаются.

Не изменяй Factory, пользовательские настройки, marketplaces, plugin installations или несвязанные
файлы без отдельного разрешения. Сохрани весь посторонний diff целевого репозитория.
```

## Опционально: Claude Code в local scope

После успешной генерации и отдельного подтверждения установки выполните bootstrap из целевого
проекта.

Windows PowerShell:

```powershell
node (Join-Path $ProjectRoot ".projectAgents\scripts\claude-plugin-init.mjs") --check
node (Join-Path $ProjectRoot ".projectAgents\scripts\claude-plugin-init.mjs")
```

Linux и macOS:

```bash
node "$PROJECT_ROOT/.projectAgents/scripts/claude-plugin-init.mjs" --check
node "$PROJECT_ROOT/.projectAgents/scripts/claude-plugin-init.mjs"
```

Bootstrap сам выполняет Claude CLI из `$ProjectRoot`, даже если скрипт вызван по абсолютному пути из
другого каталога. После `--check` он сообщает установки того же plugin ID вне local scope целевого
проекта. Они не удаляются автоматически.

После установки проверьте результат:

```powershell
Set-Location $ProjectRoot
claude plugin list --json
```

```bash
cd "$PROJECT_ROOT"
claude plugin list --json
```

У generated plugin должны быть `scope: "local"` и `projectPath`, соответствующий целевому проекту.
Откройте новый сеанс Claude Code именно в целевом проекте после установки. В другом репозитории его
commands, skills, agents и hooks загружаться не должны.

## Что добавить в Git

Закоммитьте вместе с проектом:

- `.projectAgents/`;
- `.agents/skills/`;
- `.codex/agents/`;
- `.codex/hooks.json`;
- управляемый блок Project Agent Factory в корневом `AGENTS.md`.

Не добавляйте пользовательские каталоги Codex, токены, credentials или локальные marketplace из
домашнего каталога.
