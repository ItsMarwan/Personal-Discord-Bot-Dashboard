# 🤖 Discord Bot Dashboard

A comprehensive Discord bot with a powerful web dashboard for server management. Control your Discord server remotely with message sending, embed builder, moderation tools, bulk operations, and bot presence management.

## ✨ Features

### 📬 Send DM Messages
- Send direct messages to any server member
- Full embed builder with customizable:
  - Title, description, and color
  - Footer text
  - Images and thumbnails
  - Custom fields (inline/non-inline)
- Plain text or rich embed messages
- Schedule messages with working date/time picker

### 📢 Channel Messages
- Send messages to any text channel
- Same powerful embed builder as DM feature
- Schedule announcements and updates
- Fixed date/time picker for accurate scheduling
- Preview scheduled messages

### ⚙️ Custom Command Creator
- **Create custom slash commands** with full customization:
  - Command name and description
  - Multiple option types (String, Integer, Boolean, User, Role, Channel)
  - Required/optional parameters
  - Command response type (Plain text or Embed)
  - Embed customization (title, description, color, fields, images)
  - Auto-complete suggestions for options
- **View all registered commands** with edit/delete functionality
- **Live slash command registration** to Discord
- Command usage tracking
- Reorder command options with drag-and-drop
- Clone commands for quick duplication

### 🔨 Moderation Tools
- **Kick** users with optional reason
- **Ban** users permanently
- **Timeout** users (1 minute to 28 days)
- All actions logged with reasons

### 👥 Bulk Operations
- **Bulk Role Assignment**: Add roles to multiple users at once
- **Bulk Kick**: Remove multiple users simultaneously
- Select users with checkbox interface
- Confirmation prompts for safety
- Improved UI layout with proper spacing

### 🎮 Bot Presence Management
- Set bot status (Online, Idle, DND, Invisible)
- Configure activity type (Playing, Streaming, Listening, Watching, Competing)
- Custom activity name
- Live preview of changes

### 🎨 Enhanced UI Components
- **Improved Color Picker**: Circular color selector with smooth dragging
- **Searchable Dropdowns**: Full search functionality in all dropdown menus
- **Fixed Layouts**: Proper spacing and responsive design
- **Date/Time Selector**: Fully functional scheduling picker

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18 or higher
- A Discord bot account ([create one here](https://discord.com/developers/applications))
- Your Discord server ID

### Step 1: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. **Important**: Enable these Privileged Gateway Intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copy your bot token (you'll need this later)
6. Go to OAuth2 → URL Generator
7. Select scopes: `bot` and `applications.commands`
8. Select permissions:
   - Kick Members
   - Ban Members
   - Moderate Members (for timeout)
   - Send Messages
   - Manage Roles
   - Read Message History
9. Copy the generated URL and open it to invite bot to your server

### Step 2: Get Your Server ID

1. Open Discord settings
2. Go to "Advanced" and enable "Developer Mode"
3. Right-click your server icon
4. Click "Copy Server ID"

### Step 3: Install Dependencies

```bash
cd discord-dashboard-bot
npm install
```

### Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your details:
```env
# Your bot token from Discord Developer Portal
DISCORD_BOT_TOKEN=your_bot_token_here

# Your Discord server ID
GUILD_ID=your_guild_id_here

# API port (keep default)
API_PORT=3001

# Dashboard login credentials (CHANGE THESE!)
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=changeme123

# API URL (keep default for local development)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 5: Run the Application

**Before starting, validate your setup:**
```bash
npm run validate
```

**Option 1: Use the startup script (recommended)**
```bash
# Linux/Mac
chmod +x start.sh
./start.sh

# Windows
start.bat
```

**Option 2: Run both bot and dashboard together**
```bash
npm run dev
```

**Option 3: Run separately**

Terminal 1 (Bot):
```bash
npm run bot
```

Terminal 2 (Dashboard):
```bash
npm run web
```

**⏰ First Time Setup:**
- Wait 30 seconds for the bot to fetch all members from Discord
- Look for the message: `✅ Cached X members`
- Then open the dashboard at: **http://localhost:3000**

**⚡ Performance Note:**
The bot caches member data for 30 seconds to avoid Discord rate limits. If you add/remove members, changes will appear within 30 seconds.

## 🌐 Deploying to Vercel

### Dashboard Deployment

1. **Prepare for Vercel:**
   - Push your code to GitHub
   - Remove the bot code from deployment (Vercel only hosts the Next.js dashboard)

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     ```
     NEXT_PUBLIC_API_URL=https://your-bot-api-url.com
     ```

3. **Bot Hosting:**
   The Discord bot needs to run 24/7 separately. Host it on:
   - **Railway**: https://railway.app
   - **Bot Hosting.Net** (recommended + 100% FREE): https://bot-hosting.net/
   - **Heroku**: https://heroku.com
   - **DigitalOcean**: https://digitalocean.com
   - **AWS EC2**: https://aws.amazon.com/ec2
   - **Your own VPS**

4. **Bot Deployment Steps:**
   - Create a new project on your hosting platform
   - Deploy only the bot files (`src/bot/` directory)
   - Add environment variables (bot token, guild ID, etc.)
   - Update `API_PORT` to use the port provided by your host
   - Get the public URL of your bot API
   - Update `NEXT_PUBLIC_API_URL` in Vercel to point to your bot's API

### Environment Variables for Production

**Vercel (Dashboard):**
```env
NEXT_PUBLIC_API_URL=https://your-bot-api.railway.app
```

**Bot Host (Railway/Heroku/etc):**
```env
DISCORD_BOT_TOKEN=your_bot_token
GUILD_ID=your_guild_id
API_PORT=3001
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=your_secure_password
```

## 📱 Using the Dashboard

### Login
1. Navigate to your dashboard URL
2. Enter your username and password (from .env file)
3. You'll see your server info at the top

### Send DM Tab
1. Select a user from the dropdown (searchable)
2. Choose between plain message or embed
3. If using embed:
   - Add title, description
   - Choose color with improved color picker (drag the circle to select)
   - Add footer, images
   - Add custom fields
4. **Optional: Schedule message**:
   - Click "Schedule Message" checkbox
   - Use the date picker to select date
   - Use the time picker to select time
   - Click "Schedule DM"
5. Or click "Send DM" to send immediately

### Custom Commands Tab
1. **Create New Command**:
   - Enter command name (no spaces)
   - Add description for the command
   - Choose response type (Plain Text or Embed)
   
2. **Add Options/Parameters**:
   - Click "Add Option"
   - Choose option type:
     - String: Text input
     - Integer: Numeric input
     - Boolean: True/False toggle
     - User: Select a server member
     - Role: Select a server role
     - Channel: Select a channel
   - Set option name and description
   - Mark as Required or Optional
   - Add auto-complete suggestions (optional)
   - Drag to reorder options

3. **Build Response**:
   - If Plain Text: Enter response message
   - If Embed: Use full embed builder (title, description, color, fields, images)

4. **Register Command**:
   - Click "Create Command"
   - Command instantly registers as Discord slash command
   - Appears in Discord as `/commandname`

5. **Manage Commands**:
   - View all registered custom commands
   - Edit existing commands
   - Delete commands
   - Clone commands for faster creation

### Channel Messages Tab
1. Select a channel from the dropdown (searchable)
2. Compose message or build embed (same as DM)
3. **Optional: Schedule message**:
   - Use working date and time pickers
   - Preview scheduled message
4. Click "Send Message" to send immediately

### Moderation Tab
1. Select user to moderate (searchable dropdown)
2. Enter reason (optional)
3. Choose action:
   - Kick (removes from server)
   - Ban (permanent removal)
   - Timeout (temporary mute)
4. Confirm the action

### Bulk Operations Tab
1. **Select Multiple Users**:
   - Use checkboxes to select users
   - Select All / Deselect All options available
   
2. **For Bulk Role Add**:
   - Choose role from dropdown
   - Click "Add Role to Selected Users"
   - Confirm action

3. **For Bulk Kick**:
   - Enter reason (optional)
   - Click "Kick Selected Users"
   - Confirm the action

### Bot Presence Tab
1. Choose bot status (online, idle, dnd, invisible)
2. Select activity type
3. Enter activity name
4. See live preview
5. Click "Update Presence"

## 🔒 Security Notes

- **Change default credentials** in `.env` file immediately
- Never commit `.env` file to Git
- Use strong passwords for production
- Consider implementing OAuth2 for production dashboards
- Keep your bot token secret

## 🛠️ Troubleshooting

### Fixed Issues in Latest Update

- ✅ **Dropdown Search**: All dropdown menus now support full text search functionality
- ✅ **Schedule Date/Time Picker**: Fixed and fully functional for scheduling messages
- ✅ **Bulk Operations Layout**: Removed unnecessary white space, improved UI spacing
- ✅ **Color Picker**: Enhanced with circular selector and smooth drag-to-pick functionality

### Bot won't start
- Check if bot token is correct
- Verify Privileged Gateway Intents are enabled
- Ensure Guild ID is correct

### Can't send DMs
- User must have DMs enabled
- Bot must share a server with the user
- Bot needs "Send Messages" permission

### Moderation actions fail
- Bot must have required permissions (Kick/Ban/Timeout)
- Bot's role must be higher than target user's highest role
- Cannot moderate server owner

### Dashboard can't connect to bot
- Check if bot API is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check credentials match in bot and dashboard

### Custom Commands
- Commands must have unique names
- Command names cannot contain spaces (automatically converted to lowercase)
- Options must have descriptive names and descriptions
- Ensure bot has "applications.commands" scope in OAuth2 settings
- Commands appear instantly in Discord after registration

## 📦 Project Structure

```
discord-dashboard-bot/
├── src/
│   └── bot/
│       └── index.js          # Discord bot + API server
├── pages/
│   ├── _app.js               # Next.js app wrapper
│   └── index.js              # Dashboard main page
├── styles/
│   ├── Dashboard.module.css  # Dashboard styles
│   └── globals.css           # Global styles
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🎨 Customization

### Custom Commands Builder - Advanced Features

The custom command creator offers extensive customization:

#### Command Options
- **String Options**: Free text input with optional auto-complete suggestions
- **Integer Options**: Numeric input with min/max value constraints
- **Boolean Options**: True/False toggles for conditional command behavior
- **User Options**: Select any server member for user-targeted commands
- **Role Options**: Select server roles for role-based operations
- **Channel Options**: Select specific channels for channel-related commands

#### Response Customization
- **Plain Text Responses**: Simple text messages with variable substitution
- **Embed Responses**: 
  - Customizable title and description
  - Full color picker with visual preview
  - Footer text with optional timestamp
  - Add multiple custom fields (inline or full-width)
  - Image and thumbnail support
  - Author information
  - Dynamic fields based on command options

#### Command Organization
- Drag-and-drop option reordering
- Clone existing commands to save time
- Edit command responses without re-registering
- Bulk delete commands
- Search through registered commands
- Command usage analytics

### Add More Features
The bot API (`src/bot/index.js`) is built with Express, making it easy to add new endpoints.

Example - Add a new feature:
```javascript
// In src/bot/index.js
app.post('/api/my-feature', authenticate, async (req, res) => {
  // Your code here
});
```

## 📄 License

MIT License - feel free to use this for personal or commercial projects!

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all environment variables are set correctly
3. Check bot permissions in Discord
4. Review console logs for error messages

## 🌟 Recently Added

- [x] Custom slash command creator with full customization
- [x] Message tracking and response indicators
- [x] Searchable dropdown menus throughout dashboard
- [x] Fixed date/time scheduling picker
- [x] Improved color picker with drag-to-select
- [x] Enhanced bulk operations UI
- [x] Message scheduling for DMs and channel messages

## 🔮 Features Coming Soon

- [ ] Custom command event triggers
- [ ] Message reactions and emoji support
- [ ] Advanced logging and audit trails
- [ ] Server statistics and analytics dashboard
- [ ] Role hierarchy management
- [ ] Channel permission editor
- [ ] Automated moderation rules

---

Made with ❤️ for Discord server management
