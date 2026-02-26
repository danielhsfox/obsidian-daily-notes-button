# Daily Notes Button

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22daily-notes-button%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/danielhsfox/obsidian-daily-notes-button)
![GitHub](https://img.shields.io/github/license/danielhsfox/obsidian-daily-notes-button)

A minimalist Obsidian plugin that adds a customizable button to create or open your daily note with template processing and smart task migration.

## ✨ Features

- 📅 **One-click daily note** - Create or open today's note instantly
- 🔄 **Template support** - Process Templater-like commands in your templates
- 📋 **Smart task migration** - Auto-carries unfinished tasks (including subtasks) from yesterday
- 🌍 **Conditional tasks** - Show tasks only on specific days (Spanish/English notation)
- ⌨️ **Ctrl+Click** - Open in current tab (click) or new tab (Ctrl+click)
- 🏷️ **Tag filtering** - Organize pending tasks by categories

## 📦 Installation

**Community Plugins** (recommended): Settings → Community Plugins → Browse → Search "Daily Notes Button"

**Manual**: Download from [releases](https://github.com/danielhsfox/obsidian-daily-notes-button/releases) and extract to `.obsidian/plugins/daily-notes-button/`

## 🚀 Usage

Insert this code block anywhere:

````markdown
```daily-notes-button
title: 📝 My Daily Note
pathTemplate: Templates/Daily.md
folder: Daily/2024
```
````

| Option | Description | Required |
|--------|-------------|----------|
| `title` | Button text | No |
| `pathTemplate` | Path to template | Yes |
| `folder` | Save location | No |

## 📝 Template Commands

### Date & Time
- `<% tp.date.now() %>` - Current date (YYYY-MM-DD)
- `<% tp.date.now("YYYY-MM-DD") %>` - Custom format
- `<% tp.file.title() %>` - Current file title

### Pending Tasks
- `<% YESTERDAY_PENDING_TASKS %>` - All unfinished tasks from yesterday
- `<% YESTERDAY_PENDING_TASKS:#tag %>` - Unfinished tasks from a specific tag

### Conditional Tasks
Add `[days]` at line end to show only on specific days:

```markdown
- [ ] Weekly review [sun]              # English
- [ ] Revisión semanal [d]              # Spanish
- [ ] Work tasks [mon,tue,wed,thu,fri]  # Multiple days
- [ ] Weekend [0,6]                      # Numbers (0=Sunday)
```

## 🎯 Complete Example

```markdown
# Daily Note - <% tp.date.now("dddd, MMMM D") %>

#work
<% YESTERDAY_PENDING_TASKS:#work %>

#personal
<% YESTERDAY_PENDING_TASKS:#personal %>

## Today
- [ ] Morning review
- [ ] Work tasks [l,m,x,j,v]
- [ ] Weekend planning [v]
```

## ⚙️ Settings

Configure recognized tags in Settings → Daily Notes Button. Add/remove tags for use with `YESTERDAY_PENDING_TASKS:#tag`.

## 🔧 Development

```bash
git clone https://github.com/danielhsfox/obsidian-daily-notes-button
npm install
npm run dev    # development
npm run build  # production
```

## 📄 License

MIT © danielhsfox

---

**🌟 Streamline your daily notes workflow today!**