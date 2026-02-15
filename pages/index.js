import { useState } from 'react';
import Head from 'next/head';
import { CustomCheckbox, CustomSelect, CustomInput, Button, ColorPicker } from '../components/CustomUI';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [guild, setGuild] = useState(null);
  const [members, setMembers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [activeTab, setActiveTab] = useState('dm');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // States
  const [selectedUser, setSelectedUser] = useState('');
  const [dmMessage, setDmMessage] = useState('');
  const [dmEmbed, setDmEmbed] = useState({ enabled: false, title: '', description: '', color: '#000000', footer: '', image: '', thumbnail: '', fields: [] });
  
  const [selectedChannel, setSelectedChannel] = useState('');
  const [channelMessage, setChannelMessage] = useState('');
  const [channelEmbed, setChannelEmbed] = useState({ enabled: false, title: '', description: '', color: '#000000', footer: '', image: '', thumbnail: '', fields: [] });
  
  const [modUserId, setModUserId] = useState('');
  const [modReason, setModReason] = useState('');
  const [timeoutDuration, setTimeoutDuration] = useState(10);
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkRoleId, setBulkRoleId] = useState('');
  const [bulkKickReason, setBulkKickReason] = useState('');
  
  const [botStatus, setBotStatus] = useState('online');
  const [activityType, setActivityType] = useState('Playing');
  const [activityName, setActivityName] = useState('');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'username': credentials.username,
        'password': credentials.password
      }
    };
    if (body && method !== 'GET') options.body = JSON.stringify(body);

    try {
      const response = await fetch(endpoint, options);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempted with:', credentials);
    setLoading(true);
    try {
      const data = await apiRequest('/api/guild');
      console.log('Login successful:', data);
      setGuild(data);
      setIsLoggedIn(true);
      loadData();
      showNotification('Logged in successfully!');
    } catch (error) {
      console.error('Login failed:', error);
      showNotification('Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [membersData, channelsData, rolesData] = await Promise.all([
        apiRequest('/api/members'),
        apiRequest('/api/channels'),
        apiRequest('/api/roles')
      ]);
      setMembers(membersData);
      setChannels(channelsData);
      setRoles(rolesData);
    } catch (error) {
      showNotification('Failed to load data', 'error');
    }
  };

  const sendDM = async () => {
    if (!selectedUser) return showNotification('Please select a user', 'error');
    setLoading(true);
    try {
      await apiRequest('/api/dm', 'POST', {
        userId: selectedUser,
        message: dmEmbed.enabled ? null : dmMessage,
        embed: dmEmbed.enabled ? dmEmbed : null
      });
      showNotification('DM sent successfully!');
      setDmMessage('');
    } catch (error) {
      showNotification('Failed to send DM', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendChannelMessage = async () => {
    if (!selectedChannel) return showNotification('Please select a channel', 'error');
    setLoading(true);
    try {
      await apiRequest('/api/channel/message', 'POST', {
        userId: selectedChannel,
        message: channelEmbed.enabled ? null : channelMessage,
        embed: channelEmbed.enabled ? channelEmbed : null
      });
      showNotification('Message sent!');
      setChannelMessage('');
    } catch (error) {
      showNotification('Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const kickUser = async () => {
    if (!modUserId) return showNotification('Please select a user', 'error');
    setLoading(true);
    try {
      await apiRequest('/api/kick', 'POST', { userId: modUserId, reason: modReason });
      showNotification('User kicked!');
      setModUserId('');
      setModReason('');
      loadData();
    } catch (error) {
      showNotification('Failed to kick user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const banUser = async () => {
    if (!modUserId) return showNotification('Please select a user', 'error');
    setLoading(true);
    try {
      await apiRequest('/api/ban', 'POST', { userId: modUserId, reason: modReason });
      showNotification('User banned!');
      setModUserId('');
      setModReason('');
      loadData();
    } catch (error) {
      showNotification('Failed to ban user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const timeoutUser = async () => {
    if (!modUserId) return showNotification('Please select a user', 'error');
    setLoading(true);
    try {
      await apiRequest('/api/timeout', 'POST', { userId: modUserId, duration: timeoutDuration, reason: modReason });
      showNotification(`User timed out for ${timeoutDuration} minutes!`);
      setModUserId('');
      setModReason('');
    } catch (error) {
      showNotification('Failed to timeout user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bulkAddRole = async () => {
    if (selectedUsers.length === 0) return showNotification('Please select users', 'error');
    if (!bulkRoleId) return showNotification('Please select a role', 'error');
    setLoading(true);
    try {
      const result = await apiRequest('/api/bulk/role', 'POST', { userIds: selectedUsers, roleId: bulkRoleId });
      showNotification(result.message);
      setSelectedUsers([]);
      loadData();
    } catch (error) {
      showNotification('Failed to add roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bulkKick = async () => {
    if (selectedUsers.length === 0) return showNotification('Please select users', 'error');
    if (!confirm(`Kick ${selectedUsers.length} users?`)) return;
    setLoading(true);
    try {
      const result = await apiRequest('/api/bulk/kick', 'POST', { userIds: selectedUsers, reason: bulkKickReason });
      showNotification(result.message);
      setSelectedUsers([]);
      loadData();
    } catch (error) {
      showNotification('Failed to kick users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePresence = async () => {
    setLoading(true);
    try {
      await apiRequest('/api/presence', 'POST', { status: botStatus, activityType, activityName });
      showNotification('Presence updated!');
    } catch (error) {
      showNotification('Failed to update presence', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addEmbedField = (type) => {
    if (type === 'dm') {
      setDmEmbed({ ...dmEmbed, fields: [...dmEmbed.fields, { name: '', value: '', inline: false }] });
    } else {
      setChannelEmbed({ ...channelEmbed, fields: [...channelEmbed.fields, { name: '', value: '', inline: false }] });
    }
  };

  const updateEmbedField = (type, index, key, value) => {
    if (type === 'dm') {
      const newFields = [...dmEmbed.fields];
      newFields[index][key] = value;
      setDmEmbed({ ...dmEmbed, fields: newFields });
    } else {
      const newFields = [...channelEmbed.fields];
      newFields[index][key] = value;
      setChannelEmbed({ ...channelEmbed, fields: newFields });
    }
  };

  const removeEmbedField = (type, index) => {
    if (type === 'dm') {
      setDmEmbed({ ...dmEmbed, fields: dmEmbed.fields.filter((_, i) => i !== index) });
    } else {
      setChannelEmbed({ ...channelEmbed, fields: channelEmbed.fields.filter((_, i) => i !== index) });
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <Head>
          <title>Dashboard — Login</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        </Head>
        
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1>Discord Dashboard</h1>
              <p>Sign in to manage your server</p>
            </div>
            
            <form onSubmit={handleLogin} className="login-form">
              <CustomInput
                type="text"
                placeholder="Username"
                value={credentials.username}
                onChange={(val) => setCredentials({...credentials, username: val})}
              />
              <CustomInput
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(val) => setCredentials({...credentials, password: val})}
              />
              <Button variant="primary" fullWidth disabled={loading} type="submit" onClick={handleLogin}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Head>
        <title>Dashboard — {guild?.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <div className="server-info">
            <div className="logo-small">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1>{guild?.name}</h1>
              <p>{guild?.memberCount} members</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setIsLoggedIn(false)}>Sign Out</Button>
        </div>
      </header>

      <nav className="tabs">
        {['dm', 'channel', 'moderation', 'bulk', 'presence'].map(tab => (
          <button 
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'dm' && 'Direct Messages'}
            {tab === 'channel' && 'Channel Messages'}
            {tab === 'moderation' && 'Moderation'}
            {tab === 'bulk' && 'Bulk Operations'}
            {tab === 'presence' && 'Bot Presence'}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'dm' && (
          <div className="panel">
            <div className="panel-header">
              <h2>Send Direct Message</h2>
              <p>Send a message or embed to any user in your server</p>
            </div>
            
            <div className="form-section">
              <label className="form-label">Select User</label>
              <CustomSelect
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Choose a user..."
                options={members.map(m => ({ value: m.id, label: `${m.displayName} (@${m.username})` }))}
              />
            </div>

            <div className="form-section">
              <CustomCheckbox
                checked={dmEmbed.enabled}
                onChange={(e) => setDmEmbed({...dmEmbed, enabled: e.target.checked})}
                label="Use Rich Embed"
              />
            </div>

            {!dmEmbed.enabled ? (
              <div className="form-section">
                <label className="form-label">Message</label>
                <CustomInput multiline placeholder="Type your message here..." value={dmMessage} onChange={setDmMessage} />
              </div>
            ) : (
              <div className="embed-builder">
                <h3 className="embed-title">Embed Builder</h3>
                
                <div className="form-row">
                  <div>
                    <label className="form-label">Title</label>
                    <CustomInput placeholder="Embed title" value={dmEmbed.title} onChange={(val) => setDmEmbed({...dmEmbed, title: val})} />
                  </div>
                  <div>
                    <label className="form-label">Color</label>
                    <ColorPicker value={dmEmbed.color} onChange={(val) => setDmEmbed({...dmEmbed, color: val})} />
                  </div>
                </div>
                
                <label className="form-label">Description</label>
                <CustomInput multiline placeholder="Embed description" value={dmEmbed.description} onChange={(val) => setDmEmbed({...dmEmbed, description: val})} />
                
                <div className="form-row">
                  <div>
                    <label className="form-label">Image URL</label>
                    <CustomInput placeholder="https://..." value={dmEmbed.image} onChange={(val) => setDmEmbed({...dmEmbed, image: val})} />
                  </div>
                  <div>
                    <label className="form-label">Thumbnail URL</label>
                    <CustomInput placeholder="https://..." value={dmEmbed.thumbnail} onChange={(val) => setDmEmbed({...dmEmbed, thumbnail: val})} />
                  </div>
                </div>
                
                <label className="form-label">Footer</label>
                <CustomInput placeholder="Footer text" value={dmEmbed.footer} onChange={(val) => setDmEmbed({...dmEmbed, footer: val})} />

                {dmEmbed.fields.length > 0 && (
                  <div className="embed-fields">
                    <label className="form-label">Fields</label>
                    {dmEmbed.fields.map((field, index) => (
                      <div key={index} className="embed-field">
                        <div className="field-inputs">
                          <CustomInput placeholder="Field name" value={field.name} onChange={(val) => updateEmbedField('dm', index, 'name', val)} />
                          <CustomInput placeholder="Field value" value={field.value} onChange={(val) => updateEmbedField('dm', index, 'value', val)} />
                          <CustomCheckbox checked={field.inline} onChange={(e) => updateEmbedField('dm', index, 'inline', e.target.checked)} label="Inline" />
                        </div>
                        <button className="remove-field" onClick={() => removeEmbedField('dm', index)} type="button">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button variant="secondary" onClick={() => addEmbedField('dm')}>Add Field</Button>
              </div>
            )}

            <div className="form-actions">
              <Button variant="primary" onClick={sendDM} disabled={loading} fullWidth>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'channel' && (
          <div className="panel">
            <div className="panel-header">
              <h2>Send Channel Message</h2>
              <p>Post a message or embed to any channel</p>
            </div>
            
            <div className="form-section">
              <label className="form-label">Select Channel</label>
              <CustomSelect
                value={selectedChannel}
                onChange={setSelectedChannel}
                placeholder="Choose a channel..."
                options={channels.map(c => ({ value: c.id, label: `# ${c.name}` }))}
              />
            </div>

            <div className="form-section">
              <CustomCheckbox
                checked={channelEmbed.enabled}
                onChange={(e) => setChannelEmbed({...channelEmbed, enabled: e.target.checked})}
                label="Use Rich Embed"
              />
            </div>

            {!channelEmbed.enabled ? (
              <div className="form-section">
                <label className="form-label">Message</label>
                <CustomInput multiline placeholder="Type your message here..." value={channelMessage} onChange={setChannelMessage} />
              </div>
            ) : (
              <div className="embed-builder">
                <h3 className="embed-title">Embed Builder</h3>
                
                <div className="form-row">
                  <div>
                    <label className="form-label">Title</label>
                    <CustomInput placeholder="Embed title" value={channelEmbed.title} onChange={(val) => setChannelEmbed({...channelEmbed, title: val})} />
                  </div>
                  <div>
                    <label className="form-label">Color</label>
                    <ColorPicker value={channelEmbed.color} onChange={(val) => setChannelEmbed({...channelEmbed, color: val})} />
                  </div>
                </div>
                
                <label className="form-label">Description</label>
                <CustomInput multiline placeholder="Embed description" value={channelEmbed.description} onChange={(val) => setChannelEmbed({...channelEmbed, description: val})} />
                
                <div className="form-row">
                  <div>
                    <label className="form-label">Image URL</label>
                    <CustomInput placeholder="https://..." value={channelEmbed.image} onChange={(val) => setChannelEmbed({...channelEmbed, image: val})} />
                  </div>
                  <div>
                    <label className="form-label">Thumbnail URL</label>
                    <CustomInput placeholder="https://..." value={channelEmbed.thumbnail} onChange={(val) => setChannelEmbed({...channelEmbed, thumbnail: val})} />
                  </div>
                </div>
                
                <label className="form-label">Footer</label>
                <CustomInput placeholder="Footer text" value={channelEmbed.footer} onChange={(val) => setChannelEmbed({...channelEmbed, footer: val})} />

                {channelEmbed.fields.length > 0 && (
                  <div className="embed-fields">
                    <label className="form-label">Fields</label>
                    {channelEmbed.fields.map((field, index) => (
                      <div key={index} className="embed-field">
                        <div className="field-inputs">
                          <CustomInput placeholder="Field name" value={field.name} onChange={(val) => updateEmbedField('channel', index, 'name', val)} />
                          <CustomInput placeholder="Field value" value={field.value} onChange={(val) => updateEmbedField('channel', index, 'value', val)} />
                          <CustomCheckbox checked={field.inline} onChange={(e) => updateEmbedField('channel', index, 'inline', e.target.checked)} label="Inline" />
                        </div>
                        <button className="remove-field" onClick={() => removeEmbedField('channel', index)} type="button">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button variant="secondary" onClick={() => addEmbedField('channel')}>Add Field</Button>
              </div>
            )}

            <div className="form-actions">
              <Button variant="primary" onClick={sendChannelMessage} disabled={loading} fullWidth>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="panel">
            <div className="panel-header">
              <h2>User Moderation</h2>
              <p>Manage users with moderation actions</p>
            </div>
            
            <div className="form-section">
              <label className="form-label">Select User</label>
              <CustomSelect
                value={modUserId}
                onChange={setModUserId}
                placeholder="Choose a user..."
                options={members.map(m => ({ value: m.id, label: `${m.displayName} (@${m.username})` }))}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Reason (Optional)</label>
              <CustomInput placeholder="Reason for moderation action" value={modReason} onChange={setModReason} />
            </div>

            <div className="action-grid">
              <Button variant="warning" onClick={kickUser} disabled={loading}>Kick User</Button>
              <Button variant="danger" onClick={banUser} disabled={loading}>Ban User</Button>
            </div>

            <div className="divider" />

            <div className="form-section">
              <label className="form-label">Timeout Duration (minutes)</label>
              <CustomInput type="number" placeholder="10" value={timeoutDuration} onChange={(val) => setTimeoutDuration(parseInt(val) || 10)} />
            </div>

            <Button variant="secondary" onClick={timeoutUser} disabled={loading} fullWidth>Timeout User</Button>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="panel">
            <div className="panel-header">
              <h2>Bulk Operations</h2>
              <p>Perform actions on multiple users at once</p>
            </div>
            
            <div className="user-selection">
              <div className="selection-header">
                <span className="selection-count">{selectedUsers.length} users selected</span>
              </div>
              
              <div className="user-list">
                {members.map(member => (
                  <div key={member.id} className="user-item">
                    <CustomCheckbox
                      checked={selectedUsers.includes(member.id)}
                      onChange={() => toggleUserSelection(member.id)}
                      label={`${member.displayName} (@${member.username})`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bulk-section">
              <h3 className="section-title">Add Role to Selected Users</h3>
              <CustomSelect value={bulkRoleId} onChange={setBulkRoleId} placeholder="Choose a role..." options={roles.map(r => ({ value: r.id, label: r.name }))} />
              <Button variant="primary" onClick={bulkAddRole} disabled={loading} fullWidth>Add Role</Button>
            </div>

            <div className="divider" />

            <div className="bulk-section">
              <h3 className="section-title">Kick Selected Users</h3>
              <CustomInput placeholder="Reason (optional)" value={bulkKickReason} onChange={setBulkKickReason} />
              <Button variant="danger" onClick={bulkKick} disabled={loading} fullWidth>Kick Users</Button>
            </div>
          </div>
        )}

        {activeTab === 'presence' && (
          <div className="panel">
            <div className="panel-header">
              <h2>Bot Presence</h2>
              <p>Customize how your bot appears in Discord</p>
            </div>
            
            <div className="form-section">
              <label className="form-label">Status</label>
              <CustomSelect
                value={botStatus}
                onChange={setBotStatus}
                placeholder="Select status..."
                options={[
                  { value: 'online', label: '🟢 Online' },
                  { value: 'idle', label: '🟡 Idle' },
                  { value: 'dnd', label: '🔴 Do Not Disturb' },
                  { value: 'invisible', label: '⚫ Invisible' }
                ]}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Activity Type</label>
              <CustomSelect
                value={activityType}
                onChange={setActivityType}
                placeholder="Select activity..."
                options={[
                  { value: 'Playing', label: 'Playing' },
                  { value: 'Streaming', label: 'Streaming' },
                  { value: 'Listening', label: 'Listening to' },
                  { value: 'Watching', label: 'Watching' },
                  { value: 'Competing', label: 'Competing in' }
                ]}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Activity Name</label>
              <CustomInput placeholder="e.g., Minecraft" value={activityName} onChange={setActivityName} />
            </div>

            <Button variant="primary" onClick={updatePresence} disabled={loading} fullWidth>
              {loading ? 'Updating...' : 'Update Presence'}
            </Button>

            {activityName && (
              <div className="presence-preview">
                <div className="preview-label">Preview</div>
                <div className="preview-content">
                  <span className={`status-dot ${botStatus}`} />
                  <div>
                    <div className="preview-name">Your Bot</div>
                    <div className="preview-activity">{activityType} {activityName}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
