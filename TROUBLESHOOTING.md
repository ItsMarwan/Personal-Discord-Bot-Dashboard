# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Request with opcode 8 was rate limited"

**Problem:** Discord is rate limiting the bot for fetching members too frequently.

**Solutions:**
1. **This is now fixed!** The bot caches member data for 30 seconds
2. Wait 30 seconds after starting the bot before opening dashboard
3. Look for "✅ Cached X members" message in console
4. Avoid refreshing the dashboard repeatedly

**Why this happens:**
- Discord limits how often you can fetch all server members
- The bot now caches this data to prevent rate limits
- Cache refreshes automatically every 30 seconds

### ❌ "Failed to connect to bot API"

**Problem:** The dashboard can't reach the bot's API server.

**Solutions:**
1. Make sure BOTH the bot and dashboard are running:
   ```bash
   npm run dev
   ```
   
2. Check if bot is running on port 3001:
   - Look for "✅ Bot is online" message
   - Look for "🚀 API server listening on port 3001"

3. Verify .env configuration:
   ```env
   API_PORT=3001
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### ❌ "Invalid credentials" when logging in

**Problem:** Username or password is incorrect.

**Solutions:**
1. Check your .env file:
   ```env
   DASHBOARD_USERNAME=admin
   DASHBOARD_PASSWORD=changeme123
   ```

2. Make sure there are no extra spaces in the values

3. Restart both bot and dashboard after changing .env

### ❌ "Unknown Guild" or bot doesn't start

**Problem:** Bot can't find your Discord server.

**Solutions:**
1. Verify your GUILD_ID in .env is correct:
   - Enable Developer Mode in Discord
   - Right-click your server → Copy Server ID
   - Paste in .env

2. Make sure bot is invited to your server:
   - Check if bot appears in member list
   - Re-invite bot if needed

### ❌ "Invalid Token" or bot won't login

**Problem:** Discord bot token is incorrect or expired.

**Solutions:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application → Bot tab
3. Click "Reset Token" → Copy new token
4. Update DISCORD_BOT_TOKEN in .env
5. Restart the bot

### ❌ "Missing Access" or "Missing Permissions"

**Problem:** Bot doesn't have required permissions.

**Solutions:**
1. Check bot's role in server settings
2. Ensure bot role has these permissions:
   - Kick Members
   - Ban Members
   - Moderate Members
   - Send Messages
   - Manage Roles
   - Read Messages

3. Bot's role must be HIGHER than users you want to moderate

### ❌ Can't send DMs to users

**Problem:** DM sending fails for specific users.

**Solutions:**
1. User must have DMs enabled in Privacy Settings
2. Bot must share a server with the user
3. User might have blocked the bot

### ❌ Can't add roles to users

**Problem:** Bulk role add fails.

**Solutions:**
1. Bot needs "Manage Roles" permission
2. Bot's role must be higher than the role you're trying to add
3. Can't add roles that are higher than bot's highest role

### ❌ Port 3001 already in use

**Problem:** Another application is using port 3001.

**Solutions:**
1. Change API_PORT in .env to another port:
   ```env
   API_PORT=3002
   ```

2. Update NEXT_PUBLIC_API_URL to match:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3002
   ```

3. Or kill the process using port 3001:
   ```bash
   # Find process
   lsof -i :3001
   
   # Kill process (replace PID with actual process ID)
   kill -9 PID
   ```

### ❌ Dashboard shows blank page

**Problem:** Next.js isn't running or has errors.

**Solutions:**
1. Check terminal for error messages
2. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run web
   ```

3. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### ❌ "Privileged intent provided is not enabled"

**Problem:** Required bot intents not enabled in Discord.

**Solutions:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your app → Bot tab
3. Scroll to "Privileged Gateway Intents"
4. Enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Save changes and restart bot

### ❌ Embed doesn't show images

**Problem:** Image URLs are invalid or not loading.

**Solutions:**
1. Use direct image URLs (ending in .png, .jpg, .gif)
2. Use HTTPS URLs (not HTTP)
3. Test URL in browser first
4. Use image hosting like Imgur or Discord CDN

### ❌ Changes to .env not applying

**Problem:** Environment variables not updating.

**Solutions:**
1. Stop bot and dashboard (Ctrl+C)
2. Restart both:
   ```bash
   npm run dev
   ```

3. For Next.js env vars (NEXT_PUBLIC_*), you must rebuild:
   ```bash
   rm -rf .next
   npm run dev
   ```

## 🐛 Debugging Tips

### Check if bot is connected to Discord:
Look for this in terminal:
```
✅ Bot is online as YourBotName#1234
```

### Check if API server is running:
Look for this in terminal:
```
🚀 API server listening on port 3001
```

### Check if dashboard is accessible:
Open browser to: http://localhost:3000

### View detailed logs:
Check terminal output for error messages in red

### Test bot API directly:
```bash
curl http://localhost:3001/api/guild \
  -H "username: admin" \
  -H "password: yourpassword"
```

## 📞 Still Having Issues?

1. Check all error messages in terminal
2. Verify all prerequisites are installed:
   - Node.js v18+
   - npm or yarn
3. Make sure Discord Developer Portal settings are correct
4. Try creating a new bot token
5. Test with a fresh Discord server

## 🔍 Common Error Messages

| Error | What it means | Solution |
|-------|---------------|----------|
| `ECONNREFUSED` | Can't connect to API | Start the bot |
| `401 Unauthorized` | Wrong credentials | Check .env file |
| `403 Forbidden` | Missing permissions | Check bot role |
| `404 Not Found` | Invalid ID | Check Guild/User/Channel ID |
| `Missing Access` | Bot can't see channel | Check channel permissions |
| `50013` | Missing Permissions | Bot needs higher role |

## ✅ Verification Checklist

Before asking for help, verify:
- [ ] Node.js v18+ is installed
- [ ] Bot token is correct and recent
- [ ] Guild ID is correct
- [ ] Bot is invited to server
- [ ] Privileged intents are enabled
- [ ] .env file exists and is configured
- [ ] Both bot and dashboard are running
- [ ] No error messages in terminal
- [ ] Bot appears online in Discord

---

Still stuck? Check the README.md for more detailed setup instructions!
