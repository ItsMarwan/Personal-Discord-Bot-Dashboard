# ⚡ Quick Start Guide

Get your Discord dashboard up and running in 5 minutes!

## Step 1: Create Discord Bot (2 minutes)

1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name it anything
3. Go to "Bot" tab → Click "Add Bot"
4. **Enable these under "Privileged Gateway Intents":**
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Click "Reset Token" → Copy the token (save it!)

## Step 2: Invite Bot to Server (1 minute)

1. Go to OAuth2 → URL Generator
2. Check: `bot` and `applications.commands`
3. Check permissions:
   - Kick Members
   - Ban Members  
   - Moderate Members
   - Send Messages
   - Manage Roles
4. Copy URL at bottom → Open in browser → Select your server

## Step 3: Get Server ID (30 seconds)

1. In Discord: Settings → Advanced → Enable "Developer Mode"
2. Right-click your server icon → "Copy Server ID"

## Step 4: Setup Project (1 minute)

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
DISCORD_BOT_TOKEN=paste_your_token_here
GUILD_ID=paste_your_server_id_here
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=yourpassword123
```

## Step 5: Run! (30 seconds)

```bash
npm run dev
```

**Dashboard:** http://localhost:3000
**Login:** Use username/password from your .env

## 🎉 You're Done!

Now you can:
- Send DMs to users
- Post messages to channels  
- Kick/ban/timeout users
- Bulk add roles
- Change bot presence

## 🚨 Common Issues

**"Invalid Token"**
- Make sure you copied the entire token
- Check for extra spaces

**"Unknown Guild"**  
- Verify Guild ID is correct
- Bot must be in the server

**"Missing Permissions"**
- Check bot role has required permissions
- Bot role must be higher than users you moderate

## 🌐 Deploy to Production

1. **Dashboard (Vercel):**
   - Push to GitHub
   - Import in Vercel
   - Set domain: itsmarwan-blueplanet.vercel.app

2. **Bot (Railway/Heroku):**
   - Deploy bot code separately
   - Bot needs 24/7 hosting
   - Update NEXT_PUBLIC_API_URL in Vercel

---

**Need help?** Check the full README.md for detailed instructions!
