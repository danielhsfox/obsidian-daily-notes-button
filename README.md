# Daily Notes Button

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22daily-notes-button%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/yourusername/obsidian-daily-notes-button)
![GitHub](https://img.shields.io/github/license/yourusername/obsidian-daily-notes-button)

A minimalist plugin for Obsidian that adds a customizable button to create or open your daily note with automatic template processing, conditional tasks, and pending tasks migration.

## ✨ Features

- 📅 **One-click daily note access** - Creates or opens your daily note with a single click
- 🔄 **Template processing** - Supports Templater-like commands in your templates
- 📋 **Smart task migration** - Automatically carries over unfinished tasks from the previous day
- 🌍 **Multi-language day conditions** - Show tasks only on specific days using Spanish or English notation
- 🎨 **Minimalist design** - Blends perfectly with Obsidian's theme
- ⌨️ **Ctrl+Click support** - Open in current tab (normal click) or new tab (Ctrl+click)

## 📦 Installation

### From Obsidian Community Plugins (recommended)
1. Open Settings → Community Plugins
2. Disable Safe Mode
3. Click Browse and search "Daily Notes Button"
4. Install and enable

### Manual installation
1. Download the latest release from the [releases page](https://github.com/yourusername/obsidian-daily-notes-button/releases)
2. Extract to `.obsidian/plugins/daily-notes-button/`
3. Enable in Community Plugins

## 🚀 Usage

Insert a code block in any note where you want the button to appear:

````markdown
```daily-notes-button
title: 📝 My Daily Note
pathTemplate: Templates/Daily Note
folder: Daily/2024
```
````

### Configuration Options

| Option | Description | Required |
|--------|-------------|----------|
| `title` | Custom text for the button | No |
| `pathTemplate` | Path to your daily note template (including .md) | Yes |
| `folder` | Folder where daily notes will be saved | No |

## 📝 Template Commands

The plugin processes these special commands in your templates:

### Date and Time
- `<% tp.date.now() %>` - Current date (YYYY-MM-DD)
- `<% tp.date.now("YYYY-MM-DD HH:mm") %>` - Current date with time
- `<% tp.file.title() %>` - Current file title (the date)

### Pending Tasks Migration
- `<% MI_LISTA_PENDIENTES_AYER %>` - Unfinished tasks from yesterday (Spanish)
- `<% YESTERDAY_PENDING_TASKS %>` - Unfinished tasks from yesterday (English)

## 📅 Conditional Tasks

Show tasks only on specific days by adding `[days]` at the end of any line. The plugin supports multiple formats for maximum flexibility.

### Examples

#### Spanish (una letra)
```markdown
- [ ] Revisión semanal [d]              # Solo domingo
- [ ] Tareas laborales [l,m,x,j,v]       # Lunes a viernes
- [ ] Findes [s,d]                        # Sábado y domingo
- [ ] Miércoles especial [x]              # Solo miércoles
```

#### English (three letters)
```markdown
- [ ] Weekly review [sun]                 # Only Sunday
- [ ] Work tasks [mon,tue,wed,thu,fri]    # Monday to Friday
- [ ] Weekend [sat,sun]                    # Saturday and Sunday
- [ ] Wednesday special [wed]              # Only Wednesday
```

#### Full names (any language)
```markdown
- [ ] Team meeting [monday,wednesday,friday]
- [ ] Gym [lunes,miércoles,viernes]
```

#### Numbers (0=Sunday, 6=Saturday)
```markdown
- [ ] Start of week [1]                    # Monday only
- [ ] End of week [5,6]                     # Friday and Saturday
- [ ] Weekend [0,6]                         # Sunday and Saturday
```

### How it works
- Lines **without** day specification always appear
- Lines **with** day specification only appear on matching days
- The `[days]` marker is automatically removed from the final note

## 🎯 Complete Template Example

```markdown
# Daily Note - <% tp.date.now("dddd, MMMM D, YYYY") %>

## ✅ Tasks
- [ ] Morning review
- [ ] Work tasks [l,m,x,j,v]
- [ ] Weekly planning [l]
- [ ] Weekend fun [s,d]

## 📋 Pending from Yesterday
<% MI_LISTA_PENDIENTES_AYER %>

## 📝 Notes
- 
```

## 🖱️ Navigation Behavior

- **Normal click** - Opens the daily note in the current tab
- **Ctrl+click** (or Cmd+click on Mac) - Opens the daily note in a new tab

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/danielhsfox/obsidian-daily-notes-button

# Install dependencies
npm install

# Build for development (with source maps)
npm run dev

# Build for production
npm run build
```

## 📄 License

MIT © danielhsfox

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have suggestions:

- [Open an issue](https://github.com/danielhsfox/obsidian-daily-notes-button/issues)
- Reach out on the [Obsidian Discord](https://discord.gg/obsidianmd)

## 🙏 Acknowledgements

- Inspired by the Obsidian community's love for daily notes
- Built with the [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- Special thanks to the Templater plugin for inspiration

---

**Enjoy your streamlined daily note workflow!** 🌟
