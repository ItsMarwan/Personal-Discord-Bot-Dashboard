require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, PermissionFlagsBits, ActivityType } = require('discord.js');
const express = require('express');
const cors = require('cors');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ]
});

const app = express();
app.use(cors());
app.use(express.json());

// Simple authentication middleware
const authenticate = (req, res, next) => {
  const { username, password } = req.headers;
  if (username === process.env.DASHBOARD_USERNAME && password === process.env.DASHBOARD_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Cache for members to avoid rate limiting
let membersCache = null;
let membersCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Bot ready event
client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  console.log(`📊 Dashboard API running on port ${process.env.API_PORT || 3001}`);
  
  // Pre-fetch members on startup
  try {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (guild) {
      await guild.members.fetch();
      console.log(`✅ Cached ${guild.members.cache.size} members`);
    }
  } catch (error) {
    console.error('Failed to pre-fetch members:', error);
  }
});

// Helper to get guild with cached members
async function getGuildWithMembers() {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return null;
  
  // Only fetch if cache is expired
  const now = Date.now();
  if (!membersCache || now - membersCacheTime > CACHE_DURATION) {
    try {
      await guild.members.fetch();
      membersCache = guild.members.cache;
      membersCacheTime = now;
    } catch (error) {
      console.error('Rate limit hit, using cached data');
      // Use existing cache if rate limited
    }
  }
  
  return guild;
}

// === API ENDPOINTS ===

// Get server info
app.get('/api/guild', authenticate, async (req, res) => {
  try {
    const guild = await getGuildWithMembers();
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    
    res.json({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL(),
      memberCount: guild.memberCount,
      botPresence: {
        status: client.user.presence.status || 'online',
        activity: client.user.presence.activities[0] || null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all members
app.get('/api/members', authenticate, async (req, res) => {
  try {
    const guild = await getGuildWithMembers();
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    
    const members = guild.members.cache
      .filter(m => !m.user.bot)
      .map(m => ({
        id: m.id,
        username: m.user.username,
        displayName: m.displayName,
        avatar: m.user.displayAvatarURL(),
        roles: m.roles.cache.map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
        joinedAt: m.joinedAt
      }));
    
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all channels
app.get('/api/channels', authenticate, async (req, res) => {
  try {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    const channels = guild.channels.cache
      .filter(c => c.type === 0) // Text channels only
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      }));
    
    res.json(channels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all roles
app.get('/api/roles', authenticate, async (req, res) => {
  try {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    const roles = guild.roles.cache
      .filter(r => r.name !== '@everyone')
      .map(r => ({
        id: r.id,
        name: r.name,
        color: r.hexColor,
        position: r.position
      }))
      .sort((a, b) => b.position - a.position);
    
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Send DM to user
app.post('/api/dm', authenticate, async (req, res) => {
  try {
    const { userId, message, embed } = req.body;
    
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const member = await guild.members.fetch(userId);
    
    if (embed) {
      const embedMessage = new EmbedBuilder()
        .setTitle(embed.title || null)
        .setDescription(embed.description || null)
        .setColor(embed.color || '#0099ff')
        .setFooter(embed.footer ? { text: embed.footer } : null)
        .setImage(embed.image || null)
        .setThumbnail(embed.thumbnail || null);
      
      if (embed.fields && embed.fields.length > 0) {
        embedMessage.addFields(embed.fields);
      }
      
      await member.send({ embeds: [embedMessage] });
    } else {
      await member.send(message);
    }
    
    res.json({ success: true, message: 'DM sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Send message to channel
app.post('/api/channel/message', authenticate, async (req, res) => {
  try {
    const { channelId, message, embed } = req.body;
    
    const channel = client.channels.cache.get(channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    
    if (embed) {
      const embedMessage = new EmbedBuilder()
        .setTitle(embed.title || null)
        .setDescription(embed.description || null)
        .setColor(embed.color || '#0099ff')
        .setFooter(embed.footer ? { text: embed.footer } : null)
        .setImage(embed.image || null)
        .setThumbnail(embed.thumbnail || null);
      
      if (embed.fields && embed.fields.length > 0) {
        embedMessage.addFields(embed.fields);
      }
      
      await channel.send({ embeds: [embedMessage] });
    } else {
      await channel.send(message);
    }
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Kick user
app.post('/api/kick', authenticate, async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const member = await guild.members.fetch(userId);
    
    await member.kick(reason || 'No reason provided');
    
    res.json({ success: true, message: 'User kicked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Ban user
app.post('/api/ban', authenticate, async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const member = await guild.members.fetch(userId);
    
    await member.ban({ reason: reason || 'No reason provided' });
    
    res.json({ success: true, message: 'User banned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Timeout user
app.post('/api/timeout', authenticate, async (req, res) => {
  try {
    const { userId, duration, reason } = req.body;
    
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const member = await guild.members.fetch(userId);
    
    await member.timeout(duration * 60 * 1000, reason || 'No reason provided');
    
    res.json({ success: true, message: 'User timed out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk add role
app.post('/api/bulk/role', authenticate, async (req, res) => {
  try {
    const { userIds, roleId } = req.body;
    
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const role = guild.roles.cache.get(roleId);
    
    if (!role) return res.status(404).json({ error: 'Role not found' });
    
    const results = { success: 0, failed: 0 };
    
    for (const userId of userIds) {
      try {
        const member = await guild.members.fetch(userId);
        await member.roles.add(role);
        results.success++;
      } catch (error) {
        results.failed++;
        console.error(`Failed to add role to ${userId}:`, error);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Role added to ${results.success} users, ${results.failed} failed`,
      results 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk kick
app.post('/api/bulk/kick', authenticate, async (req, res) => {
  try {
    const { userIds, reason } = req.body;
    
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    
    const results = { success: 0, failed: 0 };
    
    for (const userId of userIds) {
      try {
        const member = await guild.members.fetch(userId);
        await member.kick(reason || 'Bulk kick from dashboard');
        results.success++;
      } catch (error) {
        results.failed++;
        console.error(`Failed to kick ${userId}:`, error);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Kicked ${results.success} users, ${results.failed} failed`,
      results 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update bot presence
app.post('/api/presence', authenticate, async (req, res) => {
  try {
    const { status, activityType, activityName } = req.body;
    
    const activityTypes = {
      'Playing': ActivityType.Playing,
      'Streaming': ActivityType.Streaming,
      'Listening': ActivityType.Listening,
      'Watching': ActivityType.Watching,
      'Competing': ActivityType.Competing
    };
    
    await client.user.setPresence({
      status: status || 'online',
      activities: activityName ? [{
        name: activityName,
        type: activityTypes[activityType] || ActivityType.Playing
      }] : []
    });
    
    res.json({ success: true, message: 'Presence updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);

// Start API server
const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API server listening on port ${PORT}`);
});
