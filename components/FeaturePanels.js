import { CustomInput, CustomSelect, Button, ColorPicker } from './CustomUI';

export const SchedulePanel = ({ 
  channels, scheduleChannelId, setScheduleChannelId, scheduleMessage, setScheduleMessage,
  scheduleTime, setScheduleTime, scheduleMessageAction, loading, scheduledMessages, cancelScheduledMessage 
}) => (
  <div className="panel">
    <div className="panel-header">
      <h2>Schedule Messages</h2>
      <p>Schedule messages to be sent at a specific time</p>
    </div>
    
    <div className="form-section">
      <label className="form-label">Select Channel</label>
      <CustomSelect
        value={scheduleChannelId}
        onChange={setScheduleChannelId}
        placeholder="Choose a channel..."
        options={channels.map(c => ({ value: c.id, label: `# ${c.name}` }))}
      />
    </div>

    <div className="form-section">
      <label className="form-label">Message</label>
      <CustomInput multiline placeholder="Type your message..." value={scheduleMessage} onChange={setScheduleMessage} />
    </div>

    <div className="form-section">
      <label className="form-label">Schedule Time</label>
      <CustomInput type="datetime-local" value={scheduleTime} onChange={setScheduleTime} />
    </div>

    <Button variant="primary" onClick={scheduleMessageAction} disabled={loading} fullWidth>
      {loading ? 'Scheduling...' : 'Schedule Message'}
    </Button>

    {scheduledMessages.length > 0 && (
      <div className="scheduled-list">
        <h3 className="section-title">Scheduled Messages</h3>
        {scheduledMessages.map((msg) => (
          <div key={msg.id} className="scheduled-item">
            <div>
              <div className="scheduled-message">{msg.message}</div>
              <div className="scheduled-time">{new Date(msg.scheduledTime).toLocaleString()}</div>
            </div>
            <button className="remove-field" onClick={() => cancelScheduledMessage(msg.id)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const RoleManagementPanel = ({ roles, newRoleName, setNewRoleName, newRoleColor, setNewRoleColor, createRole, deleteRole, loading }) => (
  <div className="panel">
    <div className="panel-header">
      <h2>Role Management</h2>
      <p>Create and manage server roles</p>
    </div>
    
    <div className="form-section">
      <h3 className="section-title">Create New Role</h3>
      <div className="form-row">
        <div>
          <label className="form-label">Role Name</label>
          <CustomInput placeholder="Role name" value={newRoleName} onChange={setNewRoleName} />
        </div>
        <div>
          <label className="form-label">Color</label>
          <ColorPicker value={newRoleColor} onChange={setNewRoleColor} />
        </div>
      </div>
      <Button variant="primary" onClick={createRole} disabled={loading} fullWidth>Create Role</Button>
    </div>

    <div className="divider" />

    <div className="role-list">
      <h3 className="section-title">Existing Roles</h3>
      {roles.map((role) => (
        <div key={role.id} className="role-item">
          <div className="role-info">
            <span className="role-color" style={{ backgroundColor: role.color }} />
            <span className="role-name">{role.name}</span>
          </div>
          <button className="remove-field" onClick={() => deleteRole(role.id)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  </div>
);

export const ChannelManagementPanel = ({ channels, newChannelName, setNewChannelName, newChannelType, setNewChannelType, createChannel, deleteChannel, loading }) => (
  <div className="panel">
    <div className="panel-header">
      <h2>Channel Management</h2>
      <p>Create and manage server channels</p>
    </div>
    
    <div className="form-section">
      <h3 className="section-title">Create New Channel</h3>
      <div className="form-row">
        <div>
          <label className="form-label">Channel Name</label>
          <CustomInput placeholder="channel-name" value={newChannelName} onChange={setNewChannelName} />
        </div>
        <div>
          <label className="form-label">Type</label>
          <CustomSelect
            value={newChannelType}
            onChange={setNewChannelType}
            placeholder="Select type..."
            options={[
              { value: '0', label: 'Text Channel' },
              { value: '2', label: 'Voice Channel' }
            ]}
          />
        </div>
      </div>
      <Button variant="primary" onClick={createChannel} disabled={loading} fullWidth>Create Channel</Button>
    </div>

    <div className="divider" />

    <div className="channel-list">
      <h3 className="section-title">Existing Channels</h3>
      {channels.map((channel) => (
        <div key={channel.id} className="channel-item">
          <div className="channel-info">
            <span className="channel-icon">{channel.type === 0 ? '#' : '🔊'}</span>
            <span className="channel-name">{channel.name}</span>
          </div>
          <button className="remove-field" onClick={() => deleteChannel(channel.id)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  </div>
);

export const AuditLogsPanel = ({ auditLogs }) => (
  <div className="panel">
    <div className="panel-header">
      <h2>Audit Logs</h2>
      <p>View recent server actions and events</p>
    </div>
    
    <div className="audit-logs">
      {auditLogs.length === 0 ? (
        <div className="empty-state">No audit logs available</div>
      ) : (
        auditLogs.map((log) => (
          <div key={log.id} className="audit-log-item">
            <div className="audit-executor">
              <img src={log.executor.avatar} alt={log.executor.username} className="audit-avatar" />
              <div>
                <div className="audit-username">{log.executor.username}</div>
                <div className="audit-time">{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            </div>
            <div className="audit-action">
              <span className="audit-action-type">Action: {log.actionType}</span>
              {log.target && <span className="audit-target">Target: {log.target.name}</span>}
              {log.reason && <span className="audit-reason">Reason: {log.reason}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export const StatsPanel = ({ stats }) => (
  <div className="panel">
    <div className="panel-header">
      <h2>Server Statistics</h2>
      <p>Overview of your server metrics</p>
    </div>
    
    {!stats ? (
      <div className="empty-state">Loading statistics...</div>
    ) : (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Members</div>
          <div className="stat-value">{stats.members.total}</div>
          <div className="stat-detail">
            {stats.members.humans} humans · {stats.members.bots} bots
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Online Members</div>
          <div className="stat-value">{stats.members.online}</div>
          <div className="stat-detail">Currently active</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Text Channels</div>
          <div className="stat-value">{stats.channels.text}</div>
          <div className="stat-detail">{stats.channels.total} total channels</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Voice Channels</div>
          <div className="stat-value">{stats.channels.voice}</div>
          <div className="stat-detail">{stats.channels.categories} categories</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Server Roles</div>
          <div className="stat-value">{stats.roles}</div>
          <div className="stat-detail">Role count</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Boost Level</div>
          <div className="stat-value">Level {stats.boostLevel}</div>
          <div className="stat-detail">{stats.boostCount} boosts</div>
        </div>
        
        <div className="stat-card full-width">
          <div className="stat-label">Server Created</div>
          <div className="stat-value">{new Date(stats.createdAt).toLocaleDateString()}</div>
          <div className="stat-detail">{Math.floor((Date.now() - new Date(stats.createdAt)) / (1000 * 60 * 60 * 24))} days ago</div>
        </div>
      </div>
    )}
  </div>
);
