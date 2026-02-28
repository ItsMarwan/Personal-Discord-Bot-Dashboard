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

// === NEW FEATURES ===

// Server Statistics
app.get('/api/stats', authenticate, async (req, res) => {
  try {
    const guild = await getGuildWithMembers();
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    const roles = guild.roles.cache.size;
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = guild.memberCount - bots;

    res.json({
      members: {
        total: guild.memberCount,
        humans,
        bots,
        online: onlineMembers
      },
      channels: {
        total: guild.channels.cache.size,
        text: textChannels,
        voice: voiceChannels,
        categories
      },
      roles,
      createdAt: guild.createdAt,
      boostLevel: guild.premiumTier,
      boostCount: guild.premiumSubscriptionCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Audit Log Viewer
app.get('/api/audit-logs', authenticate, async (req, res) => {
  try {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    const logs = await guild.fetchAuditLogs({ limit: 50 });
    
    const formattedLogs = logs.entries.map(entry => ({
      id: entry.id,
      action: entry.action,
      actionType: entry.actionType,
      executor: {
        id: entry.executor.id,
        username: entry.executor.username,
        avatar: entry.executor.displayAvatarURL()
      },
      target: entry.target ? {
        id: entry.target.id,
        name: entry.target.username || entry.target.name
      } : null,
      reason: entry.reason,
      createdAt: entry.createdAt
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create Role
app.post('/api/roles/create', authenticate, async (req, res) => {
  try {
    const { name, color, permissions } = req.body;
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    
    const role = await guild.roles.create({
      name,
      color: color || '#99aab5',
      permissions: permissions || []
    });

    res.json({ 
      success: true, 
      role: {
        id: role.id,
        name: role.name,
        color: role.hexColor
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Role
app.delete('/api/roles/:roleId', authenticate, async (req, res) => {
  try {
    const { roleId } = req.params;
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const role = guild.roles.cache.get(roleId);
    
    if (!role) return res.status(404).json({ error: 'Role not found' });
    
    await role.delete();
    res.json({ success: true, message: 'Role deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create Channel
app.post('/api/channels/create', authenticate, async (req, res) => {
  try {
    const { name, type } = req.body;
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    
    const channel = await guild.channels.create({
      name,
      type: type || 0 // 0 = text, 2 = voice
    });

    res.json({ 
      success: true, 
      channel: {
        id: channel.id,
        name: channel.name,
        type: channel.type
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Channel
app.delete('/api/channels/:channelId', authenticate, async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = client.channels.cache.get(channelId);
    
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    
    await channel.delete();
    res.json({ success: true, message: 'Channel deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// === DM TRACKING ===
// Storage for tracked DMs
let dmConversations = {};

// Track incoming DMs
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (message.channel.isDMBased()) {
    const userId = message.author.id;
    if (!dmConversations[userId]) {
      dmConversations[userId] = [];
    }
    dmConversations[userId].push({
      type: 'received',
      content: message.content,
      timestamp: new Date(message.createdTimestamp),
      authorId: userId,
      authorName: message.author.username
    });
  }
});

// Get DM conversations
app.get('/api/dm-inbox', authenticate, async (req, res) => {
  try {
    const conversations = Object.entries(dmConversations).map(([userId, messages]) => ({
      userId,
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content || '',
      lastMessageTime: messages[messages.length - 1]?.timestamp || null,
      hasUnread: messages.some(m => m.type === 'received')
    }));
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific conversation
app.get('/api/dm-inbox/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = dmConversations[userId] || [];
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// === CUSTOM COMMANDS ===
let customCommands = {};

// Create custom command
app.post('/api/commands/create', authenticate, async (req, res) => {
  try {
    const { name, description, options, responseType, response } = req.body;
    const commandName = name.toLowerCase().replace(/\s+/g, '');
    
    if (customCommands[commandName]) {
      return res.status(400).json({ error: 'Command with this name already exists' });
    }

    const commandData = {
      name: commandName,
      description,
      options: options || [],
      responseType: responseType || 'plain',
      response: response || '',
      createdAt: new Date()
    };

    customCommands[commandName] = commandData;

    // Register as Discord slash command
    try {
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
      const guild = client.guilds.cache.get(process.env.GUILD_ID);
      
      const slashCommandData = {
        name: commandName,
        description: description || 'Custom command',
        options: options.map(opt => ({
          name: opt.name.toLowerCase(),
          description: opt.description || 'Option',
          type: optionTypeMap[opt.type] || 3,
          required: opt.required || false,
          autocomplete: opt.autocomplete || false
        }))
      };

      await rest.post(
        Routes.applicationGuildCommands(client.user.id, guild.id),
        { body: [slashCommandData] }
      );
    } catch (error) {
      console.error('Failed to register slash command:', error);
    }

    res.json({ success: true, command: commandData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all custom commands
app.get('/api/commands', authenticate, async (req, res) => {
  try {
    const commands = Object.values(customCommands).map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      optionCount: cmd.options.length,
      responseType: cmd.responseType,
      createdAt: cmd.createdAt
    }));
    res.json(commands);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific command
app.get('/api/commands/:name', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    const command = customCommands[name.toLowerCase()];
    if (!command) {
      return res.status(404).json({ error: 'Command not found' });
    }
    res.json(command);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update custom command
app.put('/api/commands/:name', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    const { description, options, responseType, response } = req.body;
    const commandName = name.toLowerCase();
    
    if (!customCommands[commandName]) {
      return res.status(404).json({ error: 'Command not found' });
    }

    customCommands[commandName] = {
      ...customCommands[commandName],
      description: description || customCommands[commandName].description,
      options: options || customCommands[commandName].options,
      responseType: responseType || customCommands[commandName].responseType,
      response: response || customCommands[commandName].response,
      updatedAt: new Date()
    };

    res.json({ success: true, command: customCommands[commandName] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete custom command
app.delete('/api/commands/:name', authenticate, async (req, res) => {
  try {
    const { name } = req.params;
    const commandName = name.toLowerCase();
    
    if (!customCommands[commandName]) {
      return res.status(404).json({ error: 'Command not found' });
    }

    delete customCommands[commandName];
    res.json({ success: true, message: 'Command deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Option type mapping for Discord
const optionTypeMap = {
  'String': 3,
  'Integer': 4,
  'Boolean': 5,
  'User': 9,
  'Role': 8,
  'Channel': 7
};

// Handle custom slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = customCommands[interaction.commandName];
  if (!command) return;

  try {
    if (command.responseType === 'embed') {
      const embed = new EmbedBuilder()
        .setTitle(command.response.title || 'Response')
        .setDescription(command.response.description || '')
        .setColor(command.response.color || '#0099ff');
      
      if (command.response.footer) embed.setFooter({ text: command.response.footer });
      if (command.response.image) embed.setImage(command.response.image);
      if (command.response.fields) {
        embed.addFields(command.response.fields);
      }

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply(command.response || 'Command executed');
    }
  } catch (error) {
    console.error('Error executing custom command:', error);
    await interaction.reply({ content: 'An error occurred', ephemeral: true });
  }
});

// Schedule Message
let scheduledMessages = [];
app.post('/api/schedule', authenticate, async (req, res) => {
  try {
    const { channelId, message, embed, scheduledTime } = req.body;
    
    const scheduleId = Date.now().toString();
    const delay = new Date(scheduledTime).getTime() - Date.now();
    
    if (delay <= 0) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const timeout = setTimeout(async () => {
      try {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
          if (embed) {
            const embedMessage = new EmbedBuilder()
              .setTitle(embed.title || null)
              .setDescription(embed.description || null)
              .setColor(embed.color || '#0099ff');
            await channel.send({ embeds: [embedMessage] });
          } else {
            await channel.send(message);
          }
        }
        scheduledMessages = scheduledMessages.filter(sm => sm.id !== scheduleId);
      } catch (error) {
        console.error('Failed to send scheduled message:', error);
      }
    }, delay);

    scheduledMessages.push({
      id: scheduleId,
      channelId,
      message,
      scheduledTime,
      timeout
    });

    res.json({ 
      success: true, 
      scheduleId,
      message: 'Message scheduled successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get Scheduled Messages
app.get('/api/schedule', authenticate, async (req, res) => {
  try {
    const schedules = scheduledMessages.map(({ id, channelId, message, scheduledTime }) => ({
      id,
      channelId,
      message: message || 'Embed message',
      scheduledTime
    }));
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel Scheduled Message
app.delete('/api/schedule/:scheduleId', authenticate, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = scheduledMessages.find(sm => sm.id === scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    clearTimeout(schedule.timeout);
    scheduledMessages = scheduledMessages.filter(sm => sm.id !== scheduleId);
    
    res.json({ success: true, message: 'Scheduled message cancelled' });
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