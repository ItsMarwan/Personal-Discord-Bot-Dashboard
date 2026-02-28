import { CustomInput, CustomSelect, Button, ColorPicker, CustomCheckbox, MonacoEditor, CustomLanguageEditor } from './CustomUI';
import { useState } from 'react';

export const DMInboxPanel = ({ conversations, selectedConversation, setSelectedConversation, messages, members, loading, onSendMessage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  
  const selectedUser = members.find(m => m.id === selectedConversation);
  const filteredConversations = conversations.filter(conv => {
    const member = members.find(m => m.id === conv.userId);
    return member && (member.username.toLowerCase().includes(searchTerm.toLowerCase()) || member.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleSendMessage = () => {
    if (!draftMessage.trim()) return;
    if (onSendMessage) {
      onSendMessage(selectedConversation, draftMessage);
    }
    setDraftMessage('');
  };

  return (
    <div className="panel dm-inbox-panel">
      <div className="panel-header">
        <h2>DM Inbox</h2>
        <p>Manage your direct messages with server members</p>
      </div>

      <div className="dm-inbox-container">
        <div className="dm-conversations-list">
          <div className="dm-search">
            <CustomInput
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          
          <div className="conversations">
            {filteredConversations.length === 0 ? (
              <div className="empty-state">No conversations yet</div>
            ) : (
              filteredConversations.map((conv) => {
                const member = members.find(m => m.id === conv.userId);
                if (!member) return null;
                return (
                  <button
                    key={conv.userId}
                    className={`conversation-item ${conv.userId === selectedConversation ? 'active' : ''}`}
                    onClick={() => setSelectedConversation(conv.userId)}
                    type="button"
                  >
                    <div className="conversation-avatar">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-name">{member.displayName}</div>
                      <div className="conversation-preview">{conv.lastMessage || 'No messages'}</div>
                    </div>
                    {conv.hasUnread && <div className="unread-dot" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="dm-chat">
          {selectedConversation ? (
            <>
              <div className="dm-chat-header">
                <div className="dm-chat-user">
                  <div className="user-avatar">
                    {selectedUser?.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="user-name">{selectedUser?.displayName}</div>
                    <div className="user-username">@{selectedUser?.username}</div>
                  </div>
                </div>
              </div>

              <div className="dm-messages">
                {loading ? (
                  <div className="empty-state">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="empty-state">No messages in this conversation</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`dm-message ${msg.type || 'received'}`}>
                      <div className="message-content">
                        <div className="message-text">{msg.content}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="dm-input-area">
                <div className="input-container">
                  <CustomInput
                    multiline
                    placeholder="Type a message..."
                    value={draftMessage}
                    onChange={setDraftMessage}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                    disabled={!draftMessage.trim() || loading}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="dm-empty">
              <div className="empty-state">Select a conversation to view messages</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CustomCommandsPanel = ({ 
  commands, newCommand, setNewCommand, commandOptions, setCommandOptions,
  createCommand, deleteCommand, loading, members, channels, roles 
}) => {
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'create'
  const [commandActions, setCommandActions] = useState([]);
  const [actionScript, setActionScript] = useState('');
  const [scriptLanguage, setScriptLanguage] = useState('javascript');
  const [newAction, setNewAction] = useState({
    type: 'send_message',
    condition: 'always',
    conditionValue: '',
    actionValue: '',
    requireRole: '',
    requireUser: '',
    requireChannels: [],
    notRequireRoles: [],
    andConditions: [],
    cooldown: 0,
    permissions: []
  });

  const actionTypes = [
    { value: 'send_message', label: 'Send Message' },
    { value: 'send_embed', label: 'Send Embed' },
    { value: 'add_role', label: 'Add Role to User' },
    { value: 'remove_role', label: 'Remove Role from User' },
    { value: 'kick_user', label: 'Kick User' },
    { value: 'ban_user', label: 'Ban User' },
    { value: 'timeout_user', label: 'Timeout User' },
    { value: 'dm_user', label: 'DM User' },
    { value: 'react', label: 'Add Reaction' },
    { value: 'delete_message', label: 'Delete Message' },
    { value: 'execute_script', label: 'Execute Script' },
    { value: 'create_channel', label: 'Create Channel' },
    { value: 'delete_channel', label: 'Delete Channel' },
    { value: 'assign_roles', label: 'Assign Multiple Roles' },
    { value: 'log_action', label: 'Log Action to Channel' },
    { value: 'announce', label: 'Send Announcement' },
    { value: 'edit_message', label: 'Edit Previous Message' },
    { value: 'pin_message', label: 'Pin Message' },
    { value: 'unpin_message', label: 'Unpin Message' },
    { value: 'mute_user', label: 'Mute User' },
    { value: 'unmute_user', label: 'Unmute User' },
    { value: 'move_user', label: 'Move User to Voice Channel' }
  ];

  const conditionTypes = [
    { value: 'always', label: 'Always Execute' },
    { value: 'user_has_role', label: 'User Has Role' },
    { value: 'user_is', label: 'User Is Specific User' },
    { value: 'channel_is', label: 'In Specific Channel' },
    { value: 'user_not_has_role', label: 'User NOT Has Role' },
    { value: 'message_contains', label: 'Message Contains' },
    { value: 'permission_check', label: 'User Has Permission' },
    { value: 'guild_has_feature', label: 'Guild Has Feature' },
    { value: 'member_count_gt', label: 'Members Count Greater Than' },
    { value: 'cooldown_passed', label: 'Cooldown Passed' },
    { value: 'advanced', label: 'Advanced (IF/AND/NOT)' }
  ];

  const permissions = [
    { value: 'MANAGE_GUILD', label: 'Manage Guild' },
    { value: 'BAN_MEMBERS', label: 'Ban Members' },
    { value: 'KICK_MEMBERS', label: 'Kick Members' },
    { value: 'MANAGE_ROLES', label: 'Manage Roles' },
    { value: 'MANAGE_CHANNELS', label: 'Manage Channels' },
    { value: 'MODERATE_MEMBERS', label: 'Moderate Members' },
    { value: 'MANAGE_MESSAGES', label: 'Manage Messages' },
    { value: 'MANAGE_WEBHOOKS', label: 'Manage Webhooks' }
  ];

  const addOption = () => {
    setCommandOptions([...commandOptions, {
      name: '',
      description: '',
      type: 'String',
      required: false,
      autocomplete: false,
      choices: []
    }]);
  };

  const updateOption = (index, field, value) => {
    const updated = [...commandOptions];
    updated[index][field] = value;
    setCommandOptions(updated);
  };

  const removeOption = (index) => {
    setCommandOptions(commandOptions.filter((_, i) => i !== index));
  };

  const addAction = () => {
    setCommandActions([...commandActions, {
      ...newAction,
      id: Date.now()
    }]);
    setNewAction({
      type: 'send_message',
      condition: 'always',
      conditionValue: '',
      actionValue: '',
      requireRole: '',
      requireUser: '',
      requireChannels: [],
      notRequireRoles: [],
      andConditions: [],
      cooldown: 0,
      permissions: []
    });
  };

  const updateAction = (id, field, value) => {
    setCommandActions(commandActions.map(action =>
      action.id === id ? { ...action, [field]: value } : action
    ));
  };

  const removeAction = (id) => {
    setCommandActions(commandActions.filter(action => action.id !== id));
  };

  const addAndCondition = (actionId) => {
    updateAction(actionId, 'andConditions', [
      ...(commandActions.find(a => a.id === actionId)?.andConditions || []),
      { type: 'user_has_role', value: '' }
    ]);
  };

  const updateAndCondition = (actionId, index, field, value) => {
    const action = commandActions.find(a => a.id === actionId);
    if (action) {
      const updated = [...action.andConditions];
      updated[index][field] = value;
      updateAction(actionId, 'andConditions', updated);
    }
  };

  const removeAndCondition = (actionId, index) => {
    const action = commandActions.find(a => a.id === actionId);
    if (action) {
      updateAction(actionId, 'andConditions', action.andConditions.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="panel custom-commands-panel">
      <div className="panel-header">
        <h2>Custom Commands</h2>
        <p>Create and manage custom slash commands with actions and conditions</p>
      </div>

      <div className="tabs-section">
        <button
          className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
          type="button"
        >
          View Commands ({commands.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
          type="button"
        >
          Create New
        </button>
      </div>

      {activeTab === 'view' ? (
        <div className="commands-list">
          {commands.length === 0 ? (
            <div className="empty-state">No custom commands yet. Create one!</div>
          ) : (
            commands.map((cmd) => (
              <div key={cmd.name} className="command-item">
                <div className="command-info">
                  <div className="command-name">/{cmd.name}</div>
                  <div className="command-description">{cmd.description}</div>
                  <div className="command-meta">
                    <span>{cmd.optionCount} options</span>
                    <span>{cmd.actionCount} actions</span>
                  </div>
                </div>
                <button
                  className="remove-field"
                  onClick={() => deleteCommand(cmd.name)}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="command-creator">
          <div className="creator-section">
            <h3 className="section-title">Basic Command Info</h3>
            
            <div className="form-section">
              <label className="form-label">Command Name</label>
              <CustomInput
                placeholder="my_command (no spaces)"
                value={newCommand.name}
                onChange={(val) => setNewCommand({...newCommand, name: val})}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Description</label>
              <CustomInput
                placeholder="What does this command do?"
                value={newCommand.description}
                onChange={(val) => setNewCommand({...newCommand, description: val})}
              />
            </div>
          </div>

          <div className="divider" />

          <div className="creator-section">
            <h3 className="section-title">Command Options/Parameters</h3>
            <p className="section-description">Add parameters that users can provide when using the command</p>
            
            {commandOptions.length > 0 && (
              <div className="options-list">
                {commandOptions.map((opt, idx) => (
                  <div key={idx} className="option-card">
                    <div className="option-content">
                      <div className="option-row">
                        <CustomInput
                          placeholder="Option name"
                          value={opt.name}
                          onChange={(val) => updateOption(idx, 'name', val)}
                        />
                        <CustomInput
                          placeholder="Description"
                          value={opt.description}
                          onChange={(val) => updateOption(idx, 'description', val)}
                        />
                      </div>
                      <div className="option-row">
                        <CustomSelect
                          value={opt.type}
                          onChange={(val) => updateOption(idx, 'type', val)}
                          options={[
                            { value: 'String', label: 'String' },
                            { value: 'Integer', label: 'Integer' },
                            { value: 'Boolean', label: 'Boolean' },
                            { value: 'User', label: 'User' },
                            { value: 'Role', label: 'Role' },
                            { value: 'Channel', label: 'Channel' },
                            { value: 'Number', label: 'Number' },
                            { value: 'Mentionable', label: 'Mentionable' }
                          ]}
                          placeholder="Type..."
                        />
                        <CustomCheckbox
                          checked={opt.required}
                          onChange={(e) => updateOption(idx, 'required', e.target.checked)}
                          label="Required"
                        />
                        <CustomCheckbox
                          checked={opt.autocomplete}
                          onChange={(e) => updateOption(idx, 'autocomplete', e.target.checked)}
                          label="Autocomplete"
                        />
                      </div>
                    </div>
                    <button
                      className="remove-field"
                      onClick={() => removeOption(idx)}
                      type="button"
                      title="Remove option"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <Button variant="secondary" onClick={addOption} fullWidth>
              + Add Option
            </Button>
          </div>

          <div className="divider" />

          <div className="creator-section">
            <h3 className="section-title">Command Actions</h3>
            <p className="section-description">Define what happens when the command is executed</p>

            {commandActions.map((action) => (
              <div key={action.id} className="action-card">
                <div className="action-header">
                  <span className="action-type">
                    {actionTypes.find(a => a.value === action.type)?.label}
                  </span>
                  <span className="action-condition">
                    {conditionTypes.find(c => c.value === action.condition)?.label}
                  </span>
                  <button
                    className="remove-field"
                    onClick={() => removeAction(action.id)}
                    type="button"
                    title="Remove action"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                <div className="action-body">
                  <div className="form-row">
                    <div>
                      <label className="form-label">Action Type</label>
                      <CustomSelect
                        value={action.type}
                        onChange={(val) => updateAction(action.id, 'type', val)}
                        options={actionTypes}
                        placeholder="Select action..."
                      />
                    </div>
                    <div>
                      <label className="form-label">Condition</label>
                      <CustomSelect
                        value={action.condition}
                        onChange={(val) => updateAction(action.id, 'condition', val)}
                        options={conditionTypes}
                        placeholder="Select condition..."
                      />
                    </div>
                  </div>

                  {action.condition === 'user_has_role' && (
                    <div>
                      <label className="form-label">Required Role</label>
                      <CustomSelect
                        value={action.requireRole}
                        onChange={(val) => updateAction(action.id, 'requireRole', val)}
                        options={roles.map(r => ({ value: r.id, label: r.name }))}
                        placeholder="Select role..."
                      />
                    </div>
                  )}

                  {action.condition === 'user_is' && (
                    <div>
                      <label className="form-label">Specific User</label>
                      <CustomSelect
                        value={action.requireUser}
                        onChange={(val) => updateAction(action.id, 'requireUser', val)}
                        options={members.map(m => ({ value: m.id, label: `${m.displayName} (@${m.username})` }))}
                        placeholder="Select user..."
                      />
                    </div>
                  )}

                  {action.condition === 'channel_is' && (
                    <div>
                      <label className="form-label">Specific Channel</label>
                      <CustomSelect
                        value={action.requireChannels?.[0] || ''}
                        onChange={(val) => updateAction(action.id, 'requireChannels', [val])}
                        options={channels.map(c => ({ value: c.id, label: `# ${c.name}` }))}
                        placeholder="Select channel..."
                      />
                    </div>
                  )}

                  {action.condition === 'user_not_has_role' && (
                    <div>
                      <label className="form-label">NOT Having Role</label>
                      <CustomSelect
                        value={action.notRequireRoles?.[0] || ''}
                        onChange={(val) => updateAction(action.id, 'notRequireRoles', [val])}
                        options={roles.map(r => ({ value: r.id, label: r.name }))}
                        placeholder="Select role..."
                      />
                    </div>
                  )}

                  {action.condition === 'permission_check' && (
                    <div>
                      <label className="form-label">Required Permission</label>
                      <CustomSelect
                        value={action.permissions?.[0] || ''}
                        onChange={(val) => updateAction(action.id, 'permissions', [val])}
                        options={permissions}
                        placeholder="Select permission..."
                      />
                    </div>
                  )}

                  {action.condition === 'message_contains' && (
                    <div>
                      <label className="form-label">Text to Match</label>
                      <CustomInput
                        placeholder="e.g., hello, admin, etc."
                        value={action.conditionValue}
                        onChange={(val) => updateAction(action.id, 'conditionValue', val)}
                      />
                    </div>
                  )}

                  {action.condition === 'member_count_gt' && (
                    <div>
                      <label className="form-label">Member Count Threshold</label>
                      <CustomInput
                        type="number"
                        placeholder="100"
                        value={action.conditionValue}
                        onChange={(val) => updateAction(action.id, 'conditionValue', val)}
                      />
                    </div>
                  )}

                  {action.condition === 'cooldown_passed' && (
                    <div>
                      <label className="form-label">Cooldown (seconds)</label>
                      <CustomInput
                        type="number"
                        placeholder="60"
                        value={action.cooldown}
                        onChange={(val) => updateAction(action.id, 'cooldown', parseInt(val) || 0)}
                      />
                    </div>
                  )}

                  {action.condition === 'advanced' && (
                    <div>
                      <label className="form-label">Advanced Logic (IF/AND/NOT)</label>
                      <CustomLanguageEditor
                        language="simple"
                        value={action.conditionValue}
                        onChange={(val) => updateAction(action.id, 'conditionValue', val)}
                        height="120px"
                      />
                    </div>
                  )}

                  <div className="divider-small" />

                  <label className="form-label">Action Details</label>
                  {['add_role', 'remove_role', 'assign_roles'].includes(action.type) ? (
                    <CustomSelect
                      value={action.actionValue}
                      onChange={(val) => updateAction(action.id, 'actionValue', val)}
                      options={roles.map(r => ({ value: r.id, label: r.name }))}
                      placeholder="Select role..."
                    />
                  ) : ['create_channel', 'delete_channel'].includes(action.type) ? (
                    <CustomInput
                      placeholder="Channel name"
                      value={action.actionValue}
                      onChange={(val) => updateAction(action.id, 'actionValue', val)}
                    />
                  ) : ['log_action'].includes(action.type) ? (
                    <CustomSelect
                      value={action.actionValue}
                      onChange={(val) => updateAction(action.id, 'actionValue', val)}
                      options={channels.map(c => ({ value: c.id, label: `# ${c.name}` }))}
                      placeholder="Select log channel..."
                    />
                  ) : (
                    <CustomInput
                      multiline
                      placeholder={action.type === 'timeout_user' ? 'Duration in minutes' : 'Action details...'}
                      value={action.actionValue}
                      onChange={(val) => updateAction(action.id, 'actionValue', val)}
                    />
                  )}

                  {action.andConditions.length > 0 && (
                    <div className="and-conditions">
                      <h4>AND Conditions</h4>
                      {action.andConditions.map((cond, idx) => (
                        <div key={idx} className="and-condition-item">
                          <CustomSelect
                            value={cond.type}
                            onChange={(val) => updateAndCondition(action.id, idx, 'type', val)}
                            options={[
                              { value: 'user_has_role', label: 'User Has Role' },
                              { value: 'user_not_has_role', label: 'User NOT Has Role' },
                              { value: 'channel_is', label: 'Channel Is' }
                            ]}
                            placeholder="Condition..."
                          />
                          <CustomInput
                            placeholder="Value"
                            value={cond.value}
                            onChange={(val) => updateAndCondition(action.id, idx, 'value', val)}
                          />
                          <button
                            className="remove-field"
                            onClick={() => removeAndCondition(action.id, idx)}
                            type="button"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button variant="secondary" onClick={() => addAndCondition(action.id)} fullWidth>
                    + Add AND Condition
                  </Button>
                </div>
              </div>
            ))}

            <div className="new-action-form">
              <h4>Add New Action</h4>
              <div className="form-row">
                <div>
                  <label className="form-label">Action Type</label>
                  <CustomSelect
                    value={newAction.type}
                    onChange={(val) => setNewAction({...newAction, type: val})}
                    options={actionTypes}
                    placeholder="Select action..."
                  />
                </div>
                <div>
                  <label className="form-label">Condition</label>
                  <CustomSelect
                    value={newAction.condition}
                    onChange={(val) => setNewAction({...newAction, condition: val})}
                    options={conditionTypes}
                    placeholder="Select condition..."
                  />
                </div>
              </div>
              <Button variant="secondary" onClick={addAction} fullWidth>
                + Add Action
              </Button>
            </div>
          </div>

          <div className="divider" />

          <div className="creator-section">
            <h3 className="section-title">Script Editor (Optional)</h3>
            <p className="section-description">Add custom Python or JavaScript logic</p>
            
            <div>
              <label className="form-label">Script Language</label>
              <CustomSelect
                value={scriptLanguage}
                onChange={setScriptLanguage}
                options={[
                  { value: 'javascript', label: 'JavaScript' },
                  { value: 'python', label: 'Python' }
                ]}
                placeholder="Select language..."
              />
            </div>

            <label className="form-label">Script Code</label>
            <MonacoEditor
              language={scriptLanguage}
              value={actionScript}
              onChange={setActionScript}
              height="250px"
            />
          </div>

          <Button variant="primary" onClick={createCommand} disabled={loading} fullWidth size="large">
            {loading ? 'Creating...' : 'Create Command'}
          </Button>
        </div>
      )}
    </div>
  );
};

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
