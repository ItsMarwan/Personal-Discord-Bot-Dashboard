# 🤖 Discord Bot Dashboard

A comprehensive Discord bot with a powerful web dashboard for server management. Control your Discord server remotely with message sending, embed builder, moderation tools, bulk operations, and bot presence management.

## ✨ Features

### 📬 DM Users
- Send direct messages to any server member
- Full embed builder with customizable:
  - Title, description, and color
  - Footer text
  - Images and thumbnails
  - Custom fields (inline/non-inline)
- Plain text or rich embed messages

### 📢 Channel Messages
- Send messages to any text channel
- Same powerful embed builder as DM feature
- Schedule announcements and updates

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

### 🎮 Bot Presence Management
- Set bot status (Online, Idle, DND, Invisible)
- Configure activity type (Playing, Streaming, Listening, Watching, Competing)
- Custom activity name
- Live preview of changes

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

### DM Users Tab
1. Select a user from the dropdown
2. Choose between plain message or embed
3. If using embed:
   - Add title, description
   - Choose color
   - Add footer, images
   - Add custom fields
4. Click "Send DM"

### Channel Messages Tab
1. Select a channel from the dropdown
2. Compose message or build embed (same as DM)
3. Click "Send Message"

### Moderation Tab
1. Select user to moderate
2. Enter reason (optional)
3. Choose action:
   - Kick (removes from server)
   - Ban (permanent removal)
   - Timeout (temporary mute)

### Bulk Operations Tab
1. Select multiple users using checkboxes
2. **For bulk role add:**
   - Choose role from dropdown
   - Click "Add Role to Selected Users"
3. **For bulk kick:**
   - Enter reason
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

## 🌟 Features Coming Soon

- [x] Message scheduling
- [x] Advanced logging
- [x] Role management
- [x] Channel management
- [x] Audit log viewer
- [ ] Custom commands
- [x] Server statistics

---

Made with ❤️ for Discord server management
