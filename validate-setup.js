require('dotenv').config();

console.log('🔍 Validating Discord Bot Setup...\n');

const errors = [];
const warnings = [];

// Check required environment variables
if (!process.env.DISCORD_BOT_TOKEN) {
  errors.push('❌ DISCORD_BOT_TOKEN is missing');
} else if (process.env.DISCORD_BOT_TOKEN === 'your_bot_token_here') {
  errors.push('❌ DISCORD_BOT_TOKEN is not configured (still has default value)');
} else {
  console.log('✅ Bot token configured');
}

if (!process.env.GUILD_ID) {
  errors.push('❌ GUILD_ID is missing');
} else if (process.env.GUILD_ID === 'your_guild_id_here') {
  errors.push('❌ GUILD_ID is not configured (still has default value)');
} else {
  console.log('✅ Guild ID configured');
}

if (!process.env.DASHBOARD_USERNAME) {
  warnings.push('⚠️  DASHBOARD_USERNAME is missing (using default)');
} else if (process.env.DASHBOARD_USERNAME === 'admin') {
  warnings.push('⚠️  DASHBOARD_USERNAME is still set to default "admin"');
} else {
  console.log('✅ Dashboard username configured');
}

if (!process.env.DASHBOARD_PASSWORD) {
  warnings.push('⚠️  DASHBOARD_PASSWORD is missing (using default)');
} else if (process.env.DASHBOARD_PASSWORD === 'changeme123') {
  warnings.push('⚠️  DASHBOARD_PASSWORD is still set to default (CHANGE THIS!)');
} else {
  console.log('✅ Dashboard password configured');
}

console.log('✅ API Port:', process.env.API_PORT || '3001 (default)');
console.log('✅ Next.js API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001 (default)');

console.log('\n');

// Display warnings
if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(w => console.log('  ' + w));
  console.log('\n');
}

// Display errors and exit if any
if (errors.length > 0) {
  console.log('❌ ERRORS - Please fix these before starting:');
  errors.forEach(e => console.log('  ' + e));
  console.log('\n');
  console.log('📝 Steps to fix:');
  console.log('  1. Copy .env.example to .env if you haven\'t');
  console.log('  2. Edit .env and add your bot token and guild ID');
  console.log('  3. Get bot token from: https://discord.com/developers/applications');
  console.log('  4. Get guild ID by right-clicking your server (Developer Mode enabled)');
  console.log('\n');
  process.exit(1);
}

console.log('✅ Configuration looks good!\n');
console.log('You can now start the bot with: npm run dev\n');
