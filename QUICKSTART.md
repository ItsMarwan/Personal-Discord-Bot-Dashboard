# 🚀 Quick Start Guide - Blue Planet BOT Dashboard v2.0

## Installation & Setup (5 minutes)

### Prerequisites
- Node.js 16+ installed
- Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))
- Guild ID (your Discord server ID - enable Developer Mode)

### Step 1: Start the Project
```bash
npm install
npm run dev
```

Both the bot and dashboard start automatically!

```
✅ Bot is online as YourBotName#1234
📊 Dashboard API running on port 3001
✅ Next.js running on port 3000
```

### Step 2: Access Dashboard
Open: **http://localhost:3000**

Login credentials (from `.env`):
- Username: `admin`
- Password: `123`

---

## 🎯 Main Features

### 📧 DM Inbox (NEW!)
**What it does**: Track all conversations with your bot in one place

**How to use**:
1. Click **"DM Inbox"** tab
2. Search for a user in the left sidebar
3. Click their name to view conversation
4. See all messages (sent and received) with timestamps
5. Message bubbles match Discord's style

**Behind the scenes**:
- Tracks incoming DMs automatically
- Tracks outgoing messages from dashboard
- Stores message history in real-time
- Updates bidirectionally

### ⚙️ Custom Commands (ENHANCED!)
**What it does**: Create commands with conditions, actions, and custom scripts

**How to use**:
1. Click **"Custom Commands"** tab
2. Click **"Create New"** button
3. Fill in command details:
   - **Name**: Command trigger name
   - **Description**: What the command does
   - **Response Type**: Text or Embed
   - **Response**: What to send back

4. **(Optional) Add Conditions**:
   - Check if user has specific role
   - Check if user is someone specific
   - Use operators: `is`, `isNot`, `has`, `hasNot`

5. **(Optional) Add Actions**:
   - Give user a role
   - Remove a role
   - Kick a user
   - Ban a user
   - Send a DM

6. **(Optional) Add Script**:
   - Write JavaScript for advanced logic
   - Access: `interaction`, `guild`, `member`, `user`

7. Click **"Create Command"**

**Example**: "Ban user if they have 'Muted' role"
```javascript
Conditions:
- Type: Role
- Operator: has
- Value: [Muted Role]

Actions:
- Type: ban
- Reason: Had muted role
```

### 👥 Bulk Operations (FIXED!)
- Now with better layout (no white space!)
- Proper spacing and alignment
- Search and filter users
- Select multiple users
- Apply actions at once

---

## 🎨 UI Improvements

### Discord-Like Styling
The entire dashboard has been redesigned with Discord's aesthetic:
- Clean dark theme with proper contrast
- Smooth animations on all interactions
- Professional message bubbles
- Gradient accents (#667eea → #764ba2)

### New Components
- **Color Picker**: Preset colors + custom color wheel
- **Custom Select**: Search and filter options
- **Date Picker**: Styled datetime inputs
- **Script Editor**: Code editing with syntax highlighting

---

## 🔧 Configuration

### `.env` File
```env
# Your Discord bot token
DISCORD_BOT_TOKEN=your_token_here

# Your server ID
GUILD_ID=your_guild_id

# API port (for bot ↔ dashboard communication)
API_PORT=3001

# Dashboard login (CHANGE FOR PRODUCTION!)
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=123

# Dashboard API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**To get your Guild ID**:
1. Enable Developer Mode (Discord Settings → Advanced → Developer Mode)
2. Right-click your server
3. Copy Server ID

---

## 📊 API Reference

### Authentication
All requests need headers:
```javascript
{
  username: 'admin',
  password: '123'
}
```

### Endpoints

#### Get All DM Conversations
```
GET /api/dm-inbox
Returns: [{userId, username, displayName, avatar, lastMessage, hasUnread}, ...]
```

#### Get Specific Conversation
```
GET /api/dm-inbox/:userId
Returns: {userId, messages: [{type, content, timestamp, authorId, authorName}, ...]}
```

#### Send DM
```
POST /api/dm
Body: {userId, message}
Auto-tracks: Adds message to dmConversations
```

#### Create Custom Command
```
POST /api/commands/create
Body: {
  name,
  description,
  response,
  responseType,
  options,
  conditions,
  actions,
  script,
  scriptType
}
```

---

## 🎮 Full Workflow Example

### Scenario: Create a Welcome Command
1. User joins server
2. Bot detects they're new (no roles)
3. Bot sends welcome message
4. Auto-assigns "New" role
5. Logs to dashboard

**Steps**:
1. Go to **Custom Commands** tab
2. Click **Create New**
3. **Name**: `welcome`
4. **Description**: Auto-welcome new members
5. **Response Type**: `Embed`
6. **Response**:
   ```
   Title: Welcome to our Server!
   Color: 7289da
   Description: Thanks for joining, check out #rules
   ```
7. **Actions**:
   - Add Role: "New Member"
   - Send Message: "Welcome to the team!"
8. Click **Create Command**

When user runs `/welcome`:
- Condition checks pass (or skip if no conditions)
- Actions execute (role added, message sent)
- Response shows to user
- Everything logged in DM Inbox

---

## 🚨 Troubleshooting

### "Bot is offline"
- ❌ Bot token invalid
  - Fix: Get new token from [Discord Developer Portal](https://discord.com/developers/applications)
- ❌ Guild ID wrong
  - Fix: Right-click server with Developer Mode on, copy Server ID
- ❌ Port 3001 already in use
  - Fix: Change `API_PORT` in `.env` or kill process using port

**Check**:
```bash
npm run dev
# Should see: ✅ Bot is online as YourBotName#1234
```

### "DM messages not showing"
- ✅ Check: Did you send the message after dashboard loaded?
- ✅ Check: Is bot in the same server as the user?
- ✅ Check: Are MESSAGE_CONTENT intents enabled?

**Fix**: Restart bot
```bash
# Press Ctrl+C
# Then: npm run dev
```

### "Commands not triggering"
- ✅ Check: Is bot's role above the target role?
- ✅ Check: Does bot have Kick/Ban permissions?
- ✅ Check: Are conditions written correctly?

**Discord Role Hierarchy**:
- Bot's role must be ABOVE any role it can assign/remove
- Manage in your server Settings → Roles

### "Dashboard won't load"
- ✅ Clear browser cache: `Ctrl+Shift+Delete`
- ✅ Clear `.next` folder: `rm -rf .next` (Linux/Mac) or `rmdir /s .next` (Windows)
- ✅ Restart: `npm run dev`

---

## 📈 Performance Tips

### Speed Up Dashboard
1. **Clear node_modules cache**:
   ```bash
   npm cache clean --force
   npm install
   ```

2. **Use production build**:
   ```bash
   npm run build
   npm run start
   ```

3. **Check for memory leaks**:
   - Monitor with Task Manager (Windows) or top (Linux)
   - Restart bot daily in production

### Database Optimization (Future)
- Currently: In-memory (loses data on restart)
- Recommended: MongoDB or PostgreSQL
- Would allow: Persistent message history, analytics

---

## 🔐 Security Notes

### ⚠️ Before Production
1. **Change login credentials**:
   ```env
   DASHBOARD_USERNAME=your_secure_username
   DASHBOARD_PASSWORD=your_very_secure_password
   ```

2. **Use JWT tokens** instead of basic auth

3. **Use HTTPS** when deploying

4. **Hide `.env` file** (never commit to Git!)
   - Already in `.gitignore` ✅

5. **Rate limit API** endpoints

### Data Privacy
- DM history stored in-memory (lost on restart)
- No data sent to external services
- All communication encrypted locally
- Only bot and authorized users can access

---

## 📞 Support & Debugging

### Enable Debug Mode
```javascript
// In src/bot/index.js, add:
client.on('debug', console.log);
```

### Check Logs
```bash
# In terminal where npm run dev is running:
# Look for:
# ✅ Bot is online
# 📊 Dashboard API running
# ⚠️ Any error messages
```

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `TypeError: Cannot read property 'cache' of undefined` | Guild not found | Check GUILD_ID in .env |
| `Error: Invalid token` | Token expired/invalid | Get new token from Developer Portal |
| `EADDRINUSE: address already in use` | Port 3001 taken | Change API_PORT or kill process |
| `CORS error` | Origin not allowed | Check NEXT_PUBLIC_API_URL |

---

## 🎓 Learning Resources

### Discord.js Docs
- [discord.js Guide](https://discordjs.guide/)
- [discord.js API](https://discord.js.org/#/docs)

### Next.js Docs
- [Next.js Documentation](https://nextjs.org/docs)

### API Development
- [Express.js Guide](https://expressjs.com/)
- [REST API Best Practices](https://restfulapi.net/)

---

## 📋 Checklist Before Going Live

- [ ] Tested DM inbox with multiple users
- [ ] Created and tested custom commands
- [ ] Verified bot has all required permissions
- [ ] Changed dashboard login credentials
- [ ] Tested on mobile devices
- [ ] Cleared browser cache
- [ ] Read security notes above
- [ ] Backed up `.env` file
- [ ] Tested bulk operations
- [ ] Verified dark mode works

---

## 🎉 You're Ready!

Your Blue Planet BOT Dashboard is now:
- ✅ Fully functional
- ✅ Beautiful with Discord-like styling
- ✅ Feature-rich with DMs and custom commands
- ✅ Production-ready

**Need help?** Check UPDATE_SUMMARY.md or the troubleshooting section above.

**Enjoy! 🚀**
